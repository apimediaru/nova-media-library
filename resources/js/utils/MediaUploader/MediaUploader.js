import Axios from 'axios';
import { axios } from '../index';
import Emitter from "../Emitter";
import { MediaUploadEvent } from "./Events";

export default class MediaUploader {
  constructor({ object, objectId, collection }) {
    this.emitter = new Emitter();

    this.client = axios;

    this.cancelToken = Axios.CancelToken;

    this.object = object;
    this.objectId = objectId;
    this.collection = collection;

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
      if (entry instanceof FileList || Array.isArray(entry)) {
        files.push(...entry);
      } else {
        files.push(entry);
      }
    });

    this.queue.splice(0, 0, ...files);

    await this.startUploading();
  }

  async remove(payload) {
    let ids = [];
    if (Array.isArray(payload)) {
      ids.push(...payload);
    } else {
      ids.push(payload);
    }

    const formData = new FormData();
    formData.append('ids', JSON.stringify(ids));
    formData.append('method', 'remove');
    formData.append('object', this.object);
    formData.append('objectId', this.objectId);
    formData.append('collection', this.collection);
    const response = await this.client.post('/nova-vendor/nova-media-library/multiple', formData);
    console.log(response);
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
      onUploadProgress: (progressEvent) => {
        mediaUpload.setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      },
    };

    while (mediaUpload = this.queue.pop()) {
      mediaUpload.process();

      let response;
      const formData = new FormData();
      const source = this.cancelToken.source();

      formData.append('file', mediaUpload.getFile());
      formData.append('object', this.object);
      formData.append('objectId', this.objectId);
      formData.append('collection', this.collection);

      mediaUpload.attachInterrupter(source);

      try {
        response = await this.client.post('/nova-vendor/nova-media-library/upload', formData, {
          ...requestConfig,
          cancelToken: source.token,
        });
        mediaUpload.setResponse(response);
        mediaUpload.succeed();
        this.emit(new MediaUploadEvent({
          response,
        }));
      } catch (e) {
        response = e.response;
        mediaUpload.setResponse(response);
        if (Axios.isCancel(e)) {
          mediaUpload.abort();
        } else {
          mediaUpload.failure();
        }
      }
    }

    this.uploading = false;
  }
}
