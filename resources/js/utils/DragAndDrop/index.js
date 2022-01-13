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
        beforeDragStart: (trigger, stop, next) => next(),
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

  onMouseDown = (event) => {
    // Get trigger and save it
    const trigger = getClosestDirectChild(this.options.container, event.target);
    if (!trigger) { return; }
    this.trigger = trigger;

    // Check that further processing is allowed
    const proceed = this.emit('beforeStart', trigger);
    if (proceed === false) { return; }

    // Get event mouse position and save deltas
    const xy = getXY(event);
    this.startX = xy[0];
    this.startY = xy[1];
    this.deltaX = this.startX - trigger.offsetLeft;
    this.deltaY = this.startY - trigger.offsetTop;

    // Track mousemove event
    document.addEventListener('mousemove', this.onMouseMove);

    // Set timeout that prevents element from being dragging instantly
    this.clickTimeout = window.setTimeout(this.onBeforeDragStart, this.options.clickDelay);
  }

  onBeforeDragStart = () => {
    // Emit 'beforeDragStart' event that should call next callback to proceed, or stop to stop dragging
    this.emit('beforeDragStart', this.trigger, this.stop, this.startDragging);
  }

  startDragging = () => {
    // Set dragging flag
    this.isDragging = true;

    // Create ghost and locate it
    const ghost = this.options.createGhost(this.trigger, createGhost, { applyStyles, applyImportantGhostStyles });
    this.ghost = ghost;
    if (ghost) {
      this.options.ghostContainer.appendChild(ghost);
      this.updateGhostPosition();
    }

    // Attach mouseenter and mouseleave events to track intersections
    document.body.addEventListener('mouseenter', this.onMouseEnter, true);
    document.body.addEventListener('mouseleave', this.onMouseLeave, true);

    // Emit 'dragStart' event
    this.emit('dragStart', this.trigger, this.stop);
  }

  onMouseMove = (event) => {
    // Store coordinates
    const xy = getXY(event);
    this.offsetX = xy[0] - this.startX;
    this.offsetY = xy[1] - this.startY;

    // If dragging in progress perform actions
    if (this.isDragging) {
      // Update ghost position
      this.updateGhostPosition();
    }
  }

  updateGhostPosition = () => {
    const { ghost } = this;
    if (ghost) {
      const [left, top] = this.getGhostXYPosition();
      ghost.style.setProperty('top', `${top}px`);
      ghost.style.setProperty('left', `${left}px`);
    }
  }

  // Return [x, y] ghost position
  getGhostXYPosition = () => {
    return [
      this.startX + this.offsetX + this.options.ghostOffset.left,
      window.scrollY + this.offsetY + this.deltaY + this.options.ghostOffset.top,
    ];
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

  // Utilities
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

    this.startX = null;
    this.startY = null;

    this.deltaX = null;
    this.deltaY = null;

    this.offsetX = null;
    this.offsetY = null;
  }
}

export default DragAndDrop;
