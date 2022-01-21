import Emitter from '../Emitter';

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
   * @param {AbstractEvent} event
   * @return {RequestManager}
   */
  emit(event) {
    this.emitter.emit(event);
    return this;
  }

  /**
   * Returns true if manager is processing requests
   *
   * @return {Boolean}
   */
  isWorking() {
    return Boolean(this.working);
  }
}
