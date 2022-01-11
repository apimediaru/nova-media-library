import { noop } from "./utils";
import manager from './manager';

const getClosestDirectChild = (container, element) => {
  if ((!container || !element) || container === element) { return false; }

  const { children } = container;
  for (let target = element; target && target !== container; target = target.parentNode) {
    if (Array.prototype.includes.call(children, target)) {
      return target;
    }
  }

  return false;
};

class DragAndDrop {
  isDragging = false;
  trigger = null;

  constructor(el, options = {}) {
    this.options = Object.assign({
      container: el,
      ghostContainer: document.body,
      clickDelay: 250,
      on: {
        dragStart: noop,
        dragMove: noop,
        dragEnd: noop,
      },
      group: 'default',
    }, options);

    this.clickTimeout = null;

    this.registerEvents();

    manager.registerDD(this.options.group, this);
  }

  destroy = () => {

  }

  registerEvents = () => {
    this.options.container.addEventListener('mousedown', this.onMouseDown);
  }

  stop = () => {
    window.clearTimeout(this.clickTimeout);
    this.clickTimeout = null;
    this.onDragEnd();
  }

  // Events
  emit = (event, ...args) => {
    const fn = this.options.on[event];
    if (fn) {
      fn.apply(this, args);
    }
  }

  // Handlers
  onMouseDown = (event) => {
    const trigger = getClosestDirectChild(this.options.container, event.target);
    if (!trigger) { return; }
    this.trigger = trigger;
    this.clickTimeout = window.setTimeout(this.onDragStart, this.options.clickDelay);
  }

  onMouseMove = () => {
    // console.log('mousemove');
  }

  onDragStart = () => {
    this.isDragging = true;
    console.log('started dragging');
    document.addEventListener('mousemove', this.onMouseMove);
    this.emit('dragStart', this.trigger);
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
