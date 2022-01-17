import fileSize from 'filesize/lib/filesize.es6';
import { uid } from "../index";

export const states = {
  queued: 'queued',
  uploaded: 'uploaded',
  failed: 'failed',
}

export default class MediaUpload {
  static states = states;

  constructor(file) {
    this.file = file;

    this.uid = uid();

    this.state = states.queued;

    this.processed = false;

    this.response = null;
  }

  queued() {
    return this.state === states.queued;
  }

  uploaded() {
    return this.state === states.uploaded;
  }

  failed() {
    return this.state === states.failed;
  }

  failure() {
    this.state = states.failed;
  }

  succeed() {
    this.state = states.uploaded;
  }

  setProcessed(status) {
    this.processed = Boolean(status);
  }

  isProcessed() {
    return Boolean(this.processed);
  }

  getFile() {
    return this.file;
  }

  setResponse(response) {
    this.response = response;
  }

  get name() {
    return this.getFile().name;
  }

  get size() {
    return this.getFile().size;
  }

  get humanSize() {
    return fileSize(this.size);
  }
}
