const noop = () => {};

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

const manager = new DragAndDropManager();

class DragAndDrop {
  isDragging = false;

  constructor(el, options = {}) {
    this.options = Object.assign({
      container: el,
      ghostContainer: document.body,
      clickDelay: 350,
      on: {
        dragStart: noop,
        dragMove: noop,
        dragEnd: noop,
      },
      group: 'default',
    }, options);

    this.clickTimeout = null;

    this.registerEvents();

    // Todo: make better
    manager.registerDD(this.options.group, this);
  }

  destroy() {

  }
  registerEvents() {
    this.options.container.addEventListener('mousedown', this.onMouseDown);
  }
  stop() {
    window.clearTimeout(this.options.clickTimeout);
    this.clickTimeout = null;
    this.onDragEnd();
  }

  // Events
  emit(...args) {
    const event = args[0];
    const fn = this.options.on[event];
    if (fn) {
      fn.call(...[args.slice(0, 1), this]);
    }
  }
  onMouseMove = () => {
    // console.log('mousemove');
  }
  onMouseDown = () => {
    this.clickTimeout = window.setTimeout(this.onDragStart, this.options.clickDelay);
  }
  onDragStart = () => {
    this.isDragging = true;
    console.log('started dragging');
    document.addEventListener('mousemove', this.onMouseMove);
    this.emit('dragStart');
  }
  onDragEnd = () => {
    if (!this.isDragging) { return; }
    console.log('ended dragging');
    document.removeEventListener('mousemove', this.onMouseMove);
    this.emit('dragEnd');
    this.isDragging = false;
  }
}

export default DragAndDrop;
