import { AxiosResponse, CancelTokenSource } from 'axios';
import fileSize from 'filesize/lib/filesize.es6';
import { uid } from "../index";

/**
 * @const {Object} states
 */
export const states = {
  queued: 'queued',
  processed: 'processed',
  failed: 'failed',
  succeeded: 'succeeded',
  aborted: 'aborted',
}

export default class MediaUpload {
  /**
   * Event type
   * @static
   * @abstract
   * @property type
   * @type {String}
   */
  static type = 'request';

  /**
   * Instance state dictionary
   * @static
   * @property {string} queued
   * @property {string} processed
   * @property {string} failed
   * @property {string} succeeded
   * @property {string} aborted
   * @type {Object}
   */
  static states = states;

  /**
   * Media upload constructor
   * @constructor MediaUpload
   * @param {File} file - file from input
   */
  constructor(file) {
    /**
     * Input file
     * @type {File}
     */
    this.file = file;

    /**
     * Unique per-session identifier
     * @type {number}
     */
    this.uid = uid();

    /**
     * Current completion state
     * @type {boolean}
     */
    this.completed = false;

    /**
     * Axios interrupter
     * @type {null|CancelTokenSource}
     */
    this.interrupter = null;

    /**
     * Axios request's response
     * @type {null|AxiosResponse}
     */
    this.response = null;

    /**
     * Reset request progress
     * @type {number}
     */

    this.resetProgress();
    this.queue();
  }

  /**
   * Read-only type
   * @abstract
   * @return {String}
   */
  get type() {
    return this.constructor.type;
  }

  /**
   * Set state flag to queued
   * @returns {MediaUpload}
   */
  queue() {
    this.state = states.queued;
    return this;
  }

  /**
   * Returns true if media instance is in queued state
   * @returns {Boolean}
   */
  queued() {
    return this.state === states.queued;
  }

  /**
   * Set state flag to processed
   * @returns {MediaUpload}
   */
  process() {
    this.state = states.processed;
    return this;
  }

  /**
   * Returns true if media instance is in processed state
   * @returns {Boolean}
   */
  processed() {
    return this.state === states.processed;
  }

  /**
   * Set state flag to succeeded
   * @returns {MediaUpload}
   */
  succeed() {
    this.state = states.succeeded;
    this.complete();
    return this;
  }

  /**
   * Returns true if this instance is in succeeded state
   * @returns {Boolean}
   */
  succeeded() {
    return this.state === states.succeeded;
  }

  /**
   * Set state flag to failed
   * @returns {MediaUpload}
   */
  failure() {
    this.state = states.failed;
    this.complete();
    return this;
  }

  /**
   * Returns true if media instance is in failed state
   * @returns {Boolean}
   */
  failed() {
    return this.state === states.failed;
  }

  /**
   * Set state flag to aborted
   * @returns {MediaUpload}
   */
  abort() {
    this.state = states.aborted;
    this.complete();
    return this;
  }

  /**
   * Returns true if media instance is in aborted state
   * @returns {Boolean}
   */
  aborted() {
    return this.state === states.aborted;
  }

  /**
   * Returns true if request processing is finished
   * @returns {Boolean}
   */
  isCompleted() {
    return Boolean(this.completed);
  }

  /**
   * Set instance complete flag
   * @returns {MediaUpload}
   */
  complete(state = true) {
    this.completed = state;
    return this;
  }

  /**
   * Interrupt http request if media is being processed
   * @returns {MediaUpload}
   */
  interrupt() {
    if (this.processed() && this.interrupter) {
      this.interrupter.cancel();
    }
    return this;
  }

  /**
   * Link http client interrupted to instance
   * @param source
   * @returns {MediaUpload}
   */
  attachInterrupter(source) {
    this.interrupter = source;
    return this;
  }

  /**
   * Attached file
   * @returns {File}
   */
  getFile() {
    return this.file;
  }

  /**
   * Set instance response gained by request
   * @param {AxiosResponse} response
   */
  setResponse(response) {
    this.response = response;
  }

  /**
   * Get request response object
   * @returns {null|AxiosResponse}
   */
  getResponse() {
    const { response } = this;
    if (!response) {
      return null;
    }
    return this.response;
  }

  /**
   * Get request progress (0-100)
   * @returns {number}
   */
  getProgress() {
    return Number(this.progress);
  }

  /**
   * Set current session progress
   * @param value
   */
  setProgress(value) {
    this.progress = Number(value);
  }

  /**
   * Reset session current progress
   * @returns {MediaUpload}
   */

  resetProgress() {
    this.progress = 0;
    return this;
  }

  /**
   * Get file name
   * @returns {string}
   */
  get name() {
    return this.getFile().name;
  }

  /**
   * Get file size
   * @returns {number}
   */
  get size() {
    return Number(this.getFile().size);
  }

  /**
   * Get file size in human-readable format
   * @returns {string}
   */
  get humanSize() {
    return fileSize(this.size);
  }
}
