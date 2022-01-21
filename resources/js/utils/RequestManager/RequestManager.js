import Emitter from '../Emitter';
import { RequestBeforeExecutedEvent, RequestCompletedEvent } from "./Events";

export default class RequestManager {
  constructor() {
    /**
     * Event emitter instance
     *
     * @type {Emitter}
     */
    this.emitter = new Emitter();

    /**
     * Contains requests that would be triggered in a queue
     *
     * @type {AbstractRequest[]}
     */
    this.queue = [];

    /**
     * Working flag
     *
     * @type {boolean}
     */
    this.working = false;

    /**
     * Currently executed task
     *
     * @type {AbstractEvent}
     */
    this.activeTask = null;
  }

  /**
   * Adds listeners for event
   *
   * @param {String} type
   * @param {...Function} callbacks
   * @return {RequestManager}
   */
  on(type, ...callbacks) {
    this.emitter.on(type, ...callbacks);
    return this;
  }

  /**
   * Removes listener for event
   *
   * @param {String} type
   * @param {Function} callback
   * @return {RequestManager}
   */
  off(type, callback) {
    this.emitter.off(type, callback);
    return this;
  }

  /**
   * Triggers event
   *
   * @param {typeof AbstractEvent} event
   * @return {RequestManager}
   */
  emit(event) {
    this.emitter.emit(event);
    return this;
  }

  /**
   * Get currently executed task
   *
   * @return {AbstractEvent|null}
   */
  getActiveTask() {
    return this.activeTask;
  }

  /**
   * Returns true if manager is processing requests
   *
   * @return {Boolean}
   */
  isWorking() {
    return Boolean(this.working);
  }

  /**
   * Add tasks into queue and process them
   *
   * @param {...AbstractRequest|AbstractRequest[]} payload
   */
  async perform(...payload) {
    let tasks = [];
    payload.forEach((item) => {
      if (Array.isArray(item)) {
        tasks.push(...item);
      } else {
        tasks.push(item);
      }
    });
    this.queue.splice(0, 0, ...tasks);
    await this.start();
  }

  /**
   * Destroy RequestManager instance
   */
  destroy() {
    // Maybe this method will contain some code in the future.
    // But for now it's just empty
  }

  async start() {
    if (this.isWorking()) {
      return;
    }

    this.working = true;

    let task;
    while (task = this.queue.pop()) {
      this.activeTask = task;

      const requestBeforeExecutedEvent = new RequestBeforeExecutedEvent({
        request: task,
      });
      this.emit(requestBeforeExecutedEvent);
      if (requestBeforeExecutedEvent.canceled()) {
        continue;
      }

      await task.run();
      this.emit(new RequestCompletedEvent({
        request: task,
      }));
    }

    this.working = false;
    return Promise.resolve(this);
  }
}
