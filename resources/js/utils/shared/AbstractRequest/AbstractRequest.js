import Axios, { AxiosResponse, CancelTokenSource, CancelToken, AxiosStatic } from 'axios';
import { serialize } from "object-to-formdata";
import { uid } from "../../index";
import { axios } from "../../index";

const aborted = Symbol('aborted');

export const requestStates = {
  queued: 'queued',
  processed: 'processed',
  failed: 'failed',
  succeeded: 'succeeded',
  aborted: 'aborted',
}

export default class AbstractRequest {
  /**
   * Instance state dictionary
   *
   * @static
   * @property {string} queued
   * @property {string} processed
   * @property {string} failed
   * @property {string} succeeded
   * @property {string} aborted
   * @type {Object}
   */
  static states = requestStates;

  /**
   * Event cancelable
   *
   * @static
   * @abstract
   * @property abortable
   * @type {Boolean}
   */
  static abortable = false;

  /**
   * Request method
   *
   * @type {string}
   */
  static method = 'post';

  constructor(sendData = {}, requestConfig = {}) {
    /**
     * Aborted flag
     *
     * @type {boolean}
     */
    this[aborted] = false;

    /**
     * Unique per request identifier
     *
     * @type {number}
     */
    this.uid = uid();

    /**
     * Current completion state
     *
     * @type {boolean}
     */
    this.completed = false;

    /**
     * Axios interrupter
     *
     * @type {CancelTokenSource}
     */
    this.interrupter = CancelToken.source();

    /**
     * Axios request's response
     *
     * @type {null|AxiosResponse}
     */
    this.response = null;

    /**
     * Request progress
     *
     * @type {number}
     */
    this.progress = 0;

    /**
     * Request payload data
     *
     * @type {any}
     */
    this.sendData = sendData;

    /**
     * Additional parameters that would be passed to request instance
     *
     * @type {Object}
     */
    this.requestConfig = requestConfig;

    /**
     * Http-based client
     *
     * @type {AxiosStatic}
     */
    this.client = axios;

    this.queue();
  }

  /**
   * Read-only abortable
   *
   * @return {Boolean}
   */
  get abortable() {
    return this.constructor.abortable;
  }

  /**
   * Abort http request or prevent its further processing
   *
   * @returns {AbstractRequest}
   */
  abort() {
    if (this.abortable && this.processed()) {
      this.interrupter.cancel();
      this.state = requestStates.aborted;
      this.complete();
    }

    return this;
  }

  /**
   * Returns true if media instance is in aborted state
   *
   * @returns {Boolean}
   */
  aborted() {
    return this.state === requestStates.aborted;
  }

  /**
   * Get cancel token
   *
   * @return {CancelToken}
   */
  get token() {
    return this.interrupter.token;
  }

  /**
   * Set state flag to queued
   *
   * @returns {AbstractRequest}
   */
  queue() {
    this.state = requestStates.queued;

    return this;
  }

  /**
   * Returns true if media instance is in queued state
   *
   * @returns {Boolean}
   */
  queued() {
    return this.state === requestStates.queued;
  }

  /**
   * Set state flag to processed
   *
   * @returns {AbstractRequest}
   */
  process() {
    this.state = requestStates.processed;

    return this;
  }

  /**
   * Returns true if media instance is in processed state
   *
   * @returns {Boolean}
   */
  processed() {
    return this.state === requestStates.processed;
  }

  /**
   * Set state flag to succeeded
   *
   * @returns {AbstractRequest}
   */
  succeed() {
    this.state = requestStates.succeeded;

    this.complete();

    return this;
  }

  /**
   * Returns true if this instance is in succeeded state
   *
   * @returns {Boolean}
   */
  succeeded() {
    return this.state === requestStates.succeeded;
  }

  /**
   * Set state flag to failed
   *
   * @returns {AbstractRequest}
   */
  failure() {
    this.state = requestStates.failed;

    this.complete();

    return this;
  }

  /**
   * Returns true if media instance is in failed state
   * @returns {Boolean}
   */
  failed() {
    return this.state === requestStates.failed;
  }

  /**
   * Returns true if request processing is finished
   *
   * @returns {Boolean}
   */
  isCompleted() {
    return Boolean(this.completed);
  }

  /**
   * Set instance complete flag
   *
   * @returns {AbstractRequest}
   */
  complete(state = true) {
    this.completed = state;

    return this;
  }

  /**
   * Get request progress (0-100)
   *
   * @returns {number}
   */
  getProgress() {
    return Number(this.progress);
  }

  /**
   * Set current session progress
   * @param value
   *
   * @return {AbstractRequest}
   */
  setProgress(value) {
    this.progress = Number(value);

    return this;
  }

  /**
   * Reset session current progress
   *
   * @returns {AbstractRequest}
   */

  resetProgress() {
    this.progress = 0;

    return this;
  }

  /**
   * Get request url
   *
   * @abstract
   * @return {string}
   */
  getRequestUrl() {
    return '';
  }

  getRequestConfig() {
    return {
      onUploadProgress: (progressEvent) => {
        this.setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      },
      ...this.requestConfig,
    };
  }

  serializeFormData() {
    return serialize(this.sendData);
  }

  get responseData() {
    return this.response.data;
  }

  run() {
    return new Promise(async (resolve) => {
      this.process();

      let response;
      try {
        response = await this.client[this.constructor.method](
          this.getRequestUrl(),
          this.serializeFormData(),
          this.getRequestConfig(),
        );
        this.succeed();
      } catch (exception) {
        response = exception.response;
        if (this.abortable && Axios.isCancel(exception)) {
          this.abort();
        } else {
          this.failure();
        }
      }

      this.response = response;
      resolve(this);
    });
  }
}
