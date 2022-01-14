class DragAndDropManager {
  dds = {}

  constructor() {
    this.initialize();
  }

  initialize() {
    document.addEventListener('mouseup', this.onMouseUp);
  }

  destroy() {
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  onMouseUp = (event) => {
    this.event = event;
    Object.keys(this.dds).forEach(this.stop);
  }

  stop = (group) => {
    const { dds } = this;
    if (dds[group]) {
      const dd = dds[group];
      dd.setLastEvent(this.event);
      dds[group].stop();
    }
  }

  register = (group, dd) => {
    this.dds[group] = dd;
  }

  unregister = (group) => {
    this.stop(group);
    delete this.dds[group];
  }
}

export const manager = new DragAndDropManager();

export default manager;
