import { AbstractRequest } from "../../shared";
import fileSize from 'filesize/lib/filesize.es6';

const prefix = '/nova-vendor/nova-media-library';
const apiRoutes = {
  multiple: `${prefix}/multiple`,
  sort: `${prefix}/sort`,
  clear: `${prefix}/clear`,
  upload: `${prefix}/upload`,
}

export class MediaRequest extends AbstractRequest {
  static type = 'media';
}

export class MultipleMediaRequest extends MediaRequest {
  static type = 'media:multiple';

  getRequestUrl() {
    return apiRoutes.multiple;
  }
}

export class SortMediaRequest extends MediaRequest {
  static type = 'media:sort';

  getRequestUrl() {
    return apiRoutes.sort;
  }
}

export class ClearMediaRequest extends MediaRequest {
  static type = 'media:clear';

  getRequestUrl() {
    return apiRoutes.clear;
  }
}

export class UploadMediaRequest extends MediaRequest {
  static type = 'media:upload';
  static abortable = true;

  getRequestUrl() {
    return apiRoutes.upload;
  }

  /**
   * Attached file
   * @returns {File}
   */
  get sourceFile() {
    return this.sendData.file;
  }

  /**
   * Get file name
   * @returns {string}
   */
  get name() {
    return this.sourceFile.name;
  }

  /**
   * Get file size
   * @returns {number}
   */
  get size() {
    return Number(this.sourceFile.size);
  }

  /**
   * Get file size in human-readable format
   * @returns {string}
   */
  get humanSize() {
    return fileSize(this.size);
  }
}
