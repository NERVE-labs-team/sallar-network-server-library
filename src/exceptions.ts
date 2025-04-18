/**
 * Exception returned when a worker performing instance was disconnected.
 *
 * When this error occurs, the search for a new worker will automatically begin. Catching this exception gives you the opportunity to handle such a situation in the business logic. Exception can be caught in the error handler passed to the `launch()` method of `InstanceManager`.
 */
export class WorkerDisconnectedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkerDisconnectedException';
    Object.setPrototypeOf(this, WorkerDisconnectedException.prototype);
  }
}

/**
 * Exception returned when a request confirming an instance does not execute correctly.
 *
 * When this error occurs, the connection to the worker will be broken and the search for a new one will automatically begin. This error should not normally occur and if it does, report it to the developers. Exception can be caught in the error handler passed to the `launch()` method of `InstanceManager`.
 */
export class ConfirmationFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfirmationFailedException';
    Object.setPrototypeOf(this, ConfirmationFailedException.prototype);
  }
}

/**
 * Exception returned when a request rejecting an instance does not execute correctly.
 *
 * When this error occurs, the connection to the worker will be broken and the process of searching for a new one will not be started. This error should not normally occur and if it does, report it to the developers. Exception can be caught in the error handler passed to the `launch()` method of `InstanceManager`.
 */
export class RejectionFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RejectionFailedException';
    Object.setPrototypeOf(this, RejectionFailedException.prototype);
  }
}

/**
 * Exception returned when configuration given to `InstanceManager` constructor is invalid.
 */
export class InvalidConfigurationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidConfigurationException';
    Object.setPrototypeOf(this, InvalidConfigurationException.prototype);
  }
}
