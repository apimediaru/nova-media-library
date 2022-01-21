import Axios, { AxiosResponse, CancelTokenSource, CancelToken, AxiosStatic } from 'axios';
import { serialize } from "object-to-formdata";
import { uid } from "../../utils";
import { axios } from "../../utils";

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

  /**
   * Event type
   *
   * @type {string}
   */
  static type = 'request';

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
     * Request response
     *
     * @type {AxiosResponse|null}
     */
    this.response = null;

    /**
     * Axios interrupter
     *
     * @type {CancelTokenSource}
     */
    this.interrupter = CancelToken.source();

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
   * Read-only type
   * @abstract
   * @return {String}
   */
  get type() {
    return this.constructor.type;
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
   * Set request response
   *
   * @param response
   * @return {AbstractRequest}
   */
  setResponse(response) {
    this.response = response;
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

  /**
   * Http client request config
   *
   * @return {Object}
   */
  getRequestConfig() {
    return {
      cancelToken: this.interrupter.token,
      onUploadProgress: (progressEvent) => {
        this.setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      },
      ...this.requestConfig,
    };
  }

  /**
   * Serialize send data into FormData
   *
   * @return {FormData}
   */
  serializeFormData() {
    return serialize(this.sendData);
  }

  /**
   * Get response data
   *
   * @return {Object}
   */
  get responseData() {
    return this.response.data;
  }

  /**
   * Execute request
   *
   * @return {Promise}
   */
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
          console.error(exception);
          this.failure();
        }
      }

      this.setResponse(response);
      resolve(this);
    });
  }
}
