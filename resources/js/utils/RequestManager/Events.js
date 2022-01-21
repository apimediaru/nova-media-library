import { AbstractEvent } from "../../shared";

export class RequestEvent extends AbstractEvent {
  static type = 'request';

  /**
   * Attached request
   *
   * @property request
   * @type {AbstractRequest}
   * @readonly
   */
  get request () {
    return this.data.request;
  }
}

export class RequestBeforeExecutedEvent extends RequestEvent {
  static type = 'request:beforeExecuted';
  static cancelable = true;
}

export class RequestCompletedEvent extends RequestEvent {
  static type = 'request:completed';
}
