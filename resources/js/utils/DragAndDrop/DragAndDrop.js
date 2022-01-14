import { getXY, createGhost, applyImportantGhostStyles, applyStyles, getClosestDirectChild } from "./Utils";
import manager from './Manager';
import Emitter from "./Emitter";
import { DragAndDropEvents, BeforeStartEvent, BeforeDragStartEvent, DragStartEvent, DragOverEvent, DragOutEvent, DragMoveEvent, DragDropEvent } from './Events';
const { merge, throttle } = window._;

class DragAndDrop {
  // Dragging flag
  isDragging = false;

  // Source that activated drag&drop
  source = null;

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

  lastEvent = null;

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
        [DragAndDropEvents.drag.beforeStart]: (event) => event.proceed(),
      },
      group: 'default',
      throttle: 25,
    }, options);

    this.emitter = new Emitter();

    const listeners = this.options.on;
    Object.keys(listeners).forEach((type) => {
      this.emitter.on(type, listeners[type]);
    });

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

  setLastEvent = (event) => {
    this.lastEvent = event;
    return this;
  }

  stop = () => {
    window.clearTimeout(this.clickTimeout);
    this.clickTimeout = null;
    this.onDragEnd();
  }

  // Events
  emit = (event) => {
    this.emitter.emit(event);
    return this;
  }

  onMouseDown = (event) => {
    // Get source and save it
    const source = getClosestDirectChild(this.options.container, event.target);
    if (!source) { return; }
    this.source = source;

    // Check that further processing is allowed
    const beforeStartEvent = new BeforeStartEvent({
      source,
      originalEvent: event,
    });
    if (beforeStartEvent.canceled()) { return; }

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
    this.emit(new BeforeDragStartEvent({
      source: this.source,
      proceed: this.startDragging,
    }));
  }

  startDragging = (event) => {
    // Check if 'drag:beforeStart' event was canceled
    if (event.canceled()) {
      return this.stop();
    }

    // Set dragging flag
    this.isDragging = true;

    // Todo: remove
    console.log('started dragging');

    // Create ghost and locate it
    const ghost = this.options.createGhost(this.source, createGhost, { applyStyles, applyImportantGhostStyles });
    this.ghost = ghost;
    if (ghost) {
      this.options.ghostContainer.appendChild(ghost);
      this.updateGhostPosition();
    }

    // Attach mouseenter and mouseleave events to track intersections
    document.body.addEventListener('mouseenter', this.onMouseEnter, true);
    document.body.addEventListener('mouseleave', this.onMouseLeave, true);

    // Emit 'dragStart' event
    const dragStartEvent = new DragStartEvent({
      source: this.source,
    });
    this.emit(dragStartEvent);

    // If event was canceled stop processing
    if (dragStartEvent.canceled()) {
      this.stop();
    }
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
      this.emit(new DragOverEvent({
          originalEvent: event,
        source: this.source,
          target: el,
      }));
    }
  }

  onMouseLeave = (event) => {
    if (this.current === event.target) {
      const el = this.current;
      this.current = null;
      this.emit(new DragOutEvent({
        originalEvent: event,
        source: this.source,
        target: el,
      }));
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
    this.emit(new DragDropEvent({
      target: this.current,
      originalEvent: this.lastEvent,
    }));

    // Reset core logic properties
    this.cleanup();

    // Reset dragging flag
    this.isDragging = false;
  }

  // Utilities
  createGhost = createGhost

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

    this.lastEvent = null;
  }
}

export default DragAndDrop;
