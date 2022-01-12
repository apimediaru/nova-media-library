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
  insideElement = false;

  constructor(el, options = {}) {
    this.options = Object.assign({
      container: el,
      ghostContainer: document.body,
      clickDelay: 250,
      on: {
        beforeStart: noop,
        dragStart: noop,
        dragOver: noop,
        dragLeave: noop,
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
      return fn.apply(this, args);
    }
  }

  // Handlers
  onMouseDown = (event) => {
    const trigger = getClosestDirectChild(this.options.container, event.target);
    if (!trigger) { return; }
    this.trigger = trigger;
    const legit = this.emit('beforeStart', trigger);
    if (legit === false) { return; }
    this.clickTimeout = window.setTimeout(this.onDragStart, this.options.clickDelay);
  }

  onDragStart = () => {
    this.isDragging = true;
    console.log('started dragging');
    document.addEventListener('mousemove', this.onMouseMove);
    document.body.addEventListener('mouseenter', this.onMouseEnter, true);
    document.body.addEventListener('mouseleave', this.onMouseLeave, true);
    this.emit('dragStart', this.trigger);
  }

  onMouseMove = () => {
    // console.log('mousemove');
  }

  onMouseEnter = (event) => {
    console.log('enter');
    const el = getClosestDirectChild(this.options.container, event.target);
    if (el && this.insideElement !== el) {
      this.insideElement = el;
      this.emit('dragOver', el, event);
    }
  }

  onMouseLeave = (event) => {
    console.log('leave');
    const el = getClosestDirectChild(this.options.container, event.target);
    console.log(el, event.target, this.insideElement);
    if (this.insideElement === el) { return; }
    if (!el) {
      this.emit('dragLeave', this.insideElement, event);
      this.insideElement = null;
    }
  }

  sameElement = (event) => {
    // return this.lastDragLeaveElement === this.lastDragEnterElement;
  }

  onDragEnd = () => {
    if (!this.isDragging) { return; }
    console.log('ended dragging');
    document.removeEventListener('mousemove', this.onMouseMove);
    document.body.removeEventListener('mouseenter', this.onMouseEnter, true);
    document.body.removeEventListener('mouseleave', this.onMouseLeave, true);
    this.cleanup();
    this.emit('dragEnd');
    this.isDragging = false;
  }

  cleanup = () => {
    this.lastDragEnterElement = null;
    this.lastDragLeaveElement = null;
  }
}

export default DragAndDrop;
