/**
 * The minimum object returned during each interaction with worker.
 */
export interface MinimalEventPayload {
  worker_id: string;
}

/**
 * Object needed create instance of `InstanceManager`.
 */
export interface ManagerConfig {
  /**
   * Port on which the server will be launched.
   */
  http_port: number;

  /**
   * Token needed for the backend to communicate with sallar server.
   */
  program_token?: string;

  /**
   * Address of sallar server.
   */
  node_manager_server?: string;

  /**
   * Directory where program files are located.
   */
  public_path: string;

  /**
   * Flag that allows local testing of the program.
   */
  dev_mode?: boolean;
}
