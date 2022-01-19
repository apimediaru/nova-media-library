import { AbstractEvent } from "../../shared";

export class MediaEvent extends AbstractEvent {
  static type = 'file';

  /**
   * Uploaded file
   *
   * @returns {Object|null}
   */
  get file() {
    const { responseData } = this;
    if (responseData && responseData.data.file) {
      return responseData.data.file;
    }

    return null;
  }

  /**
   * Request response
   *
   * @returns {Object|null}
   */
  get response() {
    return this.data.response;
  }

  /**
   * Response data
   *
   * @returns {Object}
   */
  get responseData() {
    return this.response.data;
  }

  /**
   * Response message
   *
   * @returns {string|null}
   */
  get responseMessage() {
    return this.response.message || null;
  }
}

export class MediaUploadEvent extends MediaEvent {
  static type = 'file:upload';
}
