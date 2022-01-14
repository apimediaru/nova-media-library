import { noop, getXY, createGhost, applyImportantGhostStyles, applyStyles, getClosestDirectChild } from "./utils";
import manager from './manager';
const { merge, throttle } = window._;

class DragAndDrop {
  // Dragging flag
  isDragging = false;

  // Trigger that activated drag&drop
  trigger = null;

  // Link to ghost element
  ghost = null;

  // Click threshold timeout id
  clickTimeout = null;

  // Options
  options = {}

  // Currently hovered element
  current = null;

  // Mouse coordinates properties
  startX = null;
  startY = null;

  deltaX = null;
  deltaY = null;

  constructor(el, options = {}) {
    // Merge options
    this.options = merge({
      container: el,
      behavior: {
        scrolling: {
          speedDivider: 10,
          manualSpeed: 750,
          startScrollMargins: { x: 0, y: 0 },
        },
      },
      createGhost: this.createGhost,
      ghostContainer: document.body,
      ghostOffset: {
        x: 20,
        y: 10,
      },
      clickDelay: 250,
      on: {
        beforeStart: noop,
        beforeDragStart: (trigger, stop, next) => next(),
        dragStart: noop,
        dragOver: noop,
        dragLeave: noop,
        dragMove: noop,
        drop: noop,
      },
      group: 'default',
      throttle: 25,
    }, options);

    this.registerEvents();

    // Throttle mousemove event handler
    this.onMouseMove = throttle(this.onMouseMove.bind(this), Number(this.options.throttle));

    manager.register(this.options.group, this);
  }

  destroy = () => {
    manager.unregister(this.options.group);
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

    // Get event mouse start position and save it
    const xy = getXY(event);

    this.startX = xy[0];
    this.startY = xy[1];

    // Start tracking 'mousemove' event
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

    // Todo: remove
    console.log('started dragging');

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
    this.deltaX = xy[0] - this.startX;
    this.deltaY = xy[1] - this.startY;

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
      window.requestAnimationFrame(() => {
        ghost.style.setProperty('top', `${top}px`);
        ghost.style.setProperty('left', `${left}px`);
      });
    }
  }

  // Return [x, y] ghost position
  getGhostXYPosition = () => {
    const x = this.startX + this.deltaX + this.options.ghostOffset.x;
    const y = this.startY + window.scrollY + this.deltaY + this.options.ghostOffset.y;
    return [x, y];
  }

  onMouseEnter = (event) => {
    const el = getClosestDirectChild(this.options.container, event.target);
    if (!el) {
      this.current = null;
    } else if (this.current !== el) {
      this.current = el;
      this.emit('dragOver', el, event);
    }
  }

  onMouseLeave = (event) => {
    if (this.current === event.target) {
      const el = this.current;
      this.current = null;
      this.emit('dragLeave', el, event);
    }
  }

  onDragEnd = () => {
    // Always stop tracking 'mousemove' event
    document.removeEventListener('mousemove', this.onMouseMove);

    if (!this.isDragging) { return; }

    // Todo: remove
    console.log('ended dragging');

    // Remove event listeners
    document.body.removeEventListener('mouseenter', this.onMouseEnter, true);
    document.body.removeEventListener('mouseleave', this.onMouseLeave, true);

    // Remove ghost from its container
    this.removeGhost();

    // Emit 'drop' event
    this.emit('drop', this.current);

    // Reset core logic properties
    this.cleanup();

    // Reset dragging flag
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
    this.current = null;

    this.startX = null;
    this.startY = null;

    this.deltaX = null;
    this.deltaY = null;
  }
  getContainerScrollTop = () => {
    const container = this.options.scrollContainer || this.options.container;
    let offset = 0;
    if (container) {
      offset = container.scrollTop;
    }
    return offset;
  }
}

export default DragAndDrop;