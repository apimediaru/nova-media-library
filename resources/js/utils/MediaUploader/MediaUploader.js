import Axios from 'axios';
import { axios } from '../index';
import Emitter from "../Emitter";

export default class MediaUploader {
  constructor({ object, id, attribute }) {
    this.emitter = new Emitter();

    this.client = axios;

    this.cancelToken = Axios.CancelToken;

    this.object = object;
    this.id = id;
    this.attribute = attribute;

    this.queue = [];

    this.uploading = false;
  }

  on(type, ...callbacks) {
    this.emitter.on(type, ...callbacks);
    return this;
  }

  off(type, callback) {
    this.emitter.off(type, callback);
    return this;
  }

  emit(event) {
    this.emitter.emit(event);
    return this;
  }

  async upload(...payload) {
    let files = [];
    payload.forEach((entry) => {
      if (entry instanceof FileList || entry instanceof Array) {
        files.push(...entry);
      } else {
        files.push(entry);
      }
    });

    this.queue.splice(0, 0, ...files);

    await this.startUploading();
  }

  isUploading() {
    return Boolean(this.uploading);
  }

  async startUploading() {
    if (this.isUploading()) {
      return;
    }

    this.uploading = true;

    let mediaUpload;

    const requestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        mediaUpload.setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      },
    };

    while (mediaUpload = this.queue.pop()) {
      mediaUpload.process();

      const formData = new FormData();
      const source = this.cancelToken.source();

      formData.append('file', mediaUpload.getFile());
      formData.append('object', this.object);
      formData.append('objectId', this.id);
      formData.append('attribute', this.attribute);

      mediaUpload.attachInterrupter(source);

      let response;
      try {
        response = await this.client.post('/nova-vendor/nova-media-library/upload', formData, {
          ...requestConfig,
          cancelToken: source.token,
        });
        mediaUpload.succeed();
      } catch (e) {
        response = e.response;

        if (Axios.isCancel(e)) {
          mediaUpload.abort();
          return;
        }

        mediaUpload.failure();
      }
      mediaUpload.setResponse(response);
    }


    this.uploading = false;
  }
}
