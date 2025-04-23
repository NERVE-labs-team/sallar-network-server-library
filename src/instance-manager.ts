import Express from 'express';
import { Server as IoServer, Socket } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { confirmProgramInstance, rejectProgramInstance } from './requests';
import { ManagerConfig, MinimalEventPayload } from './types';
import { config_application } from './helpers';
import {
  WorkerDisconnectedException,
  ConfirmationFailedException,
  RejectionFailedException,
  InvalidConfigurationException,
} from './exceptions';

type Worker = {
  socket: Socket;
  worker_id: string;
};

type SocketId = string;

/**
 * Type of handler to catch workers events.
 */
export type EventHandler<T extends MinimalEventPayload> = (
  data: T,
  self: InstanceManager
) => void | Promise<void>;

/**
 * Type of handler to catch workers errors.
 */
export type ErrorHandler = (
  data: MinimalEventPayload,
  error:
    | WorkerDisconnectedException
    | ConfirmationFailedException
    | RejectionFailedException
    | Error
) => void | Promise<void>;

/**
 * Type to create object that enables central management of all instances of programs.
 */
export class InstanceManager {
  private _config: ManagerConfig;
  private _workers_atlas: Map<SocketId, Worker> = new Map();
  private _workers_array: string[] = [];
  private _handlers: Map<string, EventHandler<any>> = new Map();
  private _express: Express.Application;
  private _io: IoServer;
  private _server: HttpServer;

  /**
   * Creates `InstanceManager` instance.
   *
   * @param config `InstanceManager` configuration.
   */
  constructor(config: ManagerConfig) {
    this._config = config;

    if (
      !this._config.dev_mode &&
      (!this._config.program_token || !this._config.node_manager_server)
    ) {
      throw new InvalidConfigurationException(
        '"program_token" and "node_manager_server" have to be provided when there is no "dev_mode" flag set'
      );
    }

    this._express = config_application(config.public_path);
    this._server = createServer(this._express);
    this._io = new IoServer(this._server);
  }

  /**
   * Express instance.
   */
  get express(): Express.Application {
    return this._express;
  }

  /**
   * Http server instance.
   */
  get server(): HttpServer {
    return this._server;
  }

  /**
   * Socket io instance.
   */
  get io(): IoServer {
    return this._io;
  }

  /**
   * Provided configuration.
   */
  get config(): ManagerConfig {
    return this._config;
  }

  /**
   * Collection of involved workers.
   */
  get workers(): string[] {
    return this._workers_array;
  }

  /**
   * Launches the server. It should be called after all handlers have been set with the `on()` method.
   *
   * @param on_connected Callback will be executed after new worker connection.
   * @param on_error Callback will be executed when any error occurrs.
   */
  async launch(
    on_connected: EventHandler<MinimalEventPayload>,
    on_error: ErrorHandler = () => {}
  ): Promise<void> {
    this.io.on('connection', (socket: Socket) => {
      socket.on('instance-launched', async (data: MinimalEventPayload) => {
        // Ensure that the event is not processed twice
        if (!data.worker_id) return;
        if (this._workers_atlas.get(socket.id)) return;
        if (this._workers_array.includes(data.worker_id)) return;

        try {
          await this.handleNewInstance(socket, data.worker_id);
          await on_connected(data, this);
        } catch (err) {
          await on_error(data, err as any);
          socket.disconnect();
          return;
        }

        for (const [event, handler] of this._handlers.entries())
          socket.on(event, async (data: MinimalEventPayload) => {
            try {
              await handler(data, this);
            } catch (err) {
              await on_error(data, err as any);
            }
          });

        socket.on('disconnect', async () => {
          try {
            await on_error(
              data,
              new WorkerDisconnectedException(
                'Connection to the worker has been lost'
              )
            );

            await this.handleInstanceDisconnection(socket.id);
          } catch (err) {
            await on_error(data, err as any);
          }
        });
      });
    });

    this._server.listen(this._config.http_port);
  }

  /**
   * Listens for specific messages from program instances.
   *
   * @param data Event name.
   * @param handler Callback to handle the event.
   */
  on<T extends MinimalEventPayload>(event: string, handler: EventHandler<T>) {
    this._handlers.set(event, handler);
  }

  /**
   * Emits a message to a specific instance or to all instances of the program.
   *
   * @param event Event name.
   * @param data Event payload.
   * @param worker_id Worker id. If not precised, emits event to all instances.
   */
  emit(event: string, data: object | null, worker_id?: string) {
    if (worker_id) {
      let socket: Socket | null = null;
      this._workers_atlas.forEach((v, _) => {
        if (v.worker_id === worker_id) socket = v.socket;
      });

      if (!socket) return;

      (socket as Socket).emit(event, data ?? {});
      return;
    }

    this.io.emit(event, data);
  }

  /**
   * Shuts down the server.
   */
  async close() {
    await this.io.close();
    this.server.close();
  }

  private async handleNewInstance(
    socket: Socket,
    worker_id: string
  ): Promise<void> {
    await confirmProgramInstance(worker_id, this.config);
    this._workers_atlas.set(socket.id, { worker_id, socket });
    this._workers_array.push(worker_id);
  }

  private async handleInstanceDisconnection(socket_id: string): Promise<void> {
    const worker = this._workers_atlas.get(socket_id);
    if (!worker) return;
    this._workers_atlas.delete(socket_id);
    this._workers_array = this._workers_array.filter(
      (value) => value !== worker.worker_id
    );

    await rejectProgramInstance(worker.worker_id, this.config);
  }
}
