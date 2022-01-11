class DragAndDropManager {
  constructor() {
    this.dds = {};

    this.onMouseUp = () => {
      Object.keys(this.dds).forEach((group) => this.dds[group].stop());
    }

    this.register();
  }

  register() {
    document.addEventListener('mouseup', this.onMouseUp);
  }

  destroy() {
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  registerDD(group, dd) {
    this.dds[group] = dd;
  }
}

export const manager = new DragAndDropManager();

export default manager;
