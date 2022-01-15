import Emitter from "../Emitter";

export default class MediaUploader {
  constructor({ object, id, attribute }) {
    this.emitter = new Emitter();

    this.client = Nova.request();

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

  async upload(payload) {
    let files = [];
    if (payload instanceof FileList || payload instanceof Array) {
      files.push(...[...payload].reverse());
    } else {
      files.push(payload);
    }

    this.queue.splice(0, 0, files);
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

    let file;
    while (file = this.queue.pop()) {
      const formData = new FormData();

      formData.append('file', file);
      formData.append('object', this.object);
      formData.append('objectId', this.id);
      formData.append('attribute', this.attribute);

      try {
        const response = await this.client.put('/nova-vendor/nova-media-library/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
            console.log(percentCompleted);
          },
        });
      } catch (e) {
        console.log(e);
      }
    }

    this.uploading = false;
  }
}
