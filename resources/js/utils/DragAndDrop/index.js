import { noop, getXY, createGhost, applyImportantGhostStyles, applyStyles } from "./utils";
import merge from 'lodash/merge';
import manager from './manager';
const { _ } = window;

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

const locateGhost = (element, [top, left] = []) => {
  if (element) {
    element.style.setProperty('top', `${top}px`);
    element.style.setProperty('left', `${left}px`);
  }
}

class DragAndDrop {
  isDragging = false;
  trigger = null;
  insideElement = false;
  ghost = null;
  clickTimeout = null;

  startX = null;
  startY = null;
  deltaX = null;
  deltaY = null;
  offsetX = null;
  offsetY = null;

  constructor(el, options = {}) {
    this.options = _.merge({
      container: el,
      createGhost: this.createGhost,
      ghostContainer: document.body,
      ghostOffset: {
        top: 20,
        left: 10,
      },
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
    const xy = getXY(event);
    this.startX = xy[0];
    this.startY = xy[1];
    this.deltaX = this.startX - trigger.offsetLeft;
    this.deltaY = this.startY - trigger.offsetTop;
    this.clickTimeout = window.setTimeout(this.onDragStart, this.options.clickDelay);
  }

  onDragStart = () => {
    this.isDragging = true;
    console.log('started dragging');
    document.addEventListener('mousemove', this.onMouseMove);
    document.body.addEventListener('mouseenter', this.onMouseEnter, true);
    document.body.addEventListener('mouseleave', this.onMouseLeave, true);
    this.emit('dragStart', this.trigger, this.stop);
  }

  onMouseMove = (event) => {
    const xy =  getXY(event);
    this.offsetX = xy[0] - this.startX;
    this.offsetY = xy[1] - this.startY;
    const { ghost } = this;
    if (ghost === null) {
      this.ghost = this.options.createGhost(this.trigger, createGhost, { applyStyles, applyImportantGhostStyles });
      if (this.ghost) {
        this.options.ghostContainer.appendChild(this.ghost);
      }
    }
    const top = window.scrollY + this.startY + this.offsetY + this.options.ghostOffset.top;
    const left = this.startX + this.offsetX + this.options.ghostOffset.left;
    locateGhost(ghost, [top, left]);
  }

  onMouseEnter = (event) => {
    const el = getClosestDirectChild(this.options.container, event.target);
    if (!el) {
      this.insideElement = null;
    } else if (this.insideElement !== el) {
      this.insideElement = el;
      this.emit('dragOver', el, event);
    }
  }

  onMouseLeave = (event) => {
    if (this.insideElement === event.target) {
      const el = this.insideElement;
      this.insideElement = null;
      this.emit('dragLeave', el, event);
    }
  }

  onDragEnd = () => {
    if (!this.isDragging) { return; }
    console.log('ended dragging');
    document.removeEventListener('mousemove', this.onMouseMove);
    document.body.removeEventListener('mouseenter', this.onMouseEnter, true);
    document.body.removeEventListener('mouseleave', this.onMouseLeave, true);
    this.cleanup();
    this.removeGhost();
    this.emit('dragEnd');
    this.isDragging = false;
  }

  createGhost = (element) => {
    return createGhost(element);
  }

  removeGhost = () => {
    if (this.ghost && this.ghost.remove) {
      this.ghost.remove();
    }
    this.ghost = null;
  }

  cleanup = () => {
    this.lastDragEnterElement = null;
    this.lastDragLeaveElement = null;
  }
}

export default DragAndDrop;
