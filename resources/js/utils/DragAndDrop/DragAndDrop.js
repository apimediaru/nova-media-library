import { getXY, createGhost, applyImportantGhostStyles, applyStyles, getClosestDirectChild } from "./utils";
import manager from './Manager';
import { Scrollable } from "./Plugins";
import Emitter from '../Emitter';
import { DragAndDropEvents, BeforeStartEvent, BeforeDragStartEvent, DragStartEvent, DragOverEvent, DragOutEvent, DragMoveEvent, DragDropEvent } from './Events';
const { merge, throttle } = window._;

export const defaultOptions = {
  container: document.body,
  behavior: {
    scrolling: {
      speedDivider: 10,
      manualSpeed: 750,
      startScrollMargins: { x: 0, y: 0 },
    },
  },
  whiteList: [],
  throttle: 25,
  createGhost: null,
  ghostContainer: document.body,
  ghostOffset: {
    x: 20,
    y: 10,
  },
  clickDelay: 250,
  threshold: 10,
  on: {
    [DragAndDropEvents.drag.beforeStart]: (event) => event.proceed(),
  },
  group: 'default',
  plugins: [],
  exclude: {
    plugins: [],
  },
}

class DragAndDrop {
  /**
   * Default plugins library uses
   * @static
   * @property {Object} Plugins
   * @property {Scrollable} Plugins.Scrollable
   * @type {Object}
   */
  static Plugins = { Scrollable };

  // Dragging flag
  dragging = false;

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

  constructor(options = {}) {
    // Merge options with defaults
    this.options = merge(defaultOptions, options);

    // Create new events emitter
    this.emitter = new Emitter();

    /**
     * Active plugins
     * @property plugins
     * @type {Plugin[]}
     */
    this.plugins = [];

    // Add provided listeners
    const listeners = this.options.on;
    Object.keys(listeners).forEach((type) => {
      this.on(type, listeners[type]);
    });

    this.registerEvents();

    const defaultPlugins = Object.values(DragAndDrop.Plugins).filter(
      (Plugin) => !this.options.exclude.plugins.includes(Plugin),
    );

    this.addPlugin(...[...defaultPlugins, ...this.options.plugins]);

    // Throttle mousemove event handler
    this.onMouseMove = throttle(this.onMouseMove.bind(this), Number(this.options.throttle));

    manager.register(this.options.group, this);
  }

  destroy = () => {
    manager.unregister(this.options.group);
  }

  /**
   * Adds plugin to this draggable instance. This will end up calling the attached method of the plugin
   * @param {...typeof Plugin} plugins - Plugins that you want attached to draggable
   * @return {DragAndDrop}
   * @example dd.addPlugin(CustomA11yPlugin, CustomMirrorPlugin)
   */
  addPlugin(...plugins) {
    const activePlugins = plugins.map((Plugin) => new Plugin(this));

    activePlugins.forEach((plugin) => plugin.attach());
    this.plugins = [...this.plugins, ...activePlugins];

    return this;
  }

  /**
   * Removes plugins that are already attached to this draggable instance. This will end up calling
   * the detach method of the plugin
   * @param {...typeof Plugin} plugins - Plugins that you want detached from draggable
   * @return {DragAndDrop}
   * @example dd.removePlugin(MirrorPlugin, CustomMirrorPlugin)
   */
  removePlugin(...plugins) {
    const removedPlugins = this.plugins.filter((plugin) => plugins.includes(plugin.constructor));

    removedPlugins.forEach((plugin) => plugin.detach());
    this.plugins = this.plugins.filter((plugin) => !plugins.includes(plugin.constructor));

    return this;
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

  /**
   * Adds listener for draggable events
   * @param {String} type - Event name
   * @param {...Function} callbacks - Event callbacks
   * @return {DragAndDrop}
   * @example dd.on('drag:start', (dragEvent) => dragEvent.cancel());
   */
  on = (type, ...callbacks) => {
    this.emitter.on(type, ...callbacks);
    return this;
  }

  /**
   * Removes listener from draggable
   * @param {String} type - Event name
   * @param {Function} callback - Event callback
   * @return {DragAndDrop}
   * @example dd.off('drag:start', handlerFunction);
   */
  off = (type, callback) => {
    this.emitter.off(type, callback);
    return this;
  }

  /**
   * Emit draggable event
   * @param {AbstractEvent} event - Event instance
   * @return {DragAndDrop}
   * @example dd.emit(event);
   */
  emit = (event) => {
    this.emitter.emit(event);
    return this;
  }

  onMouseDown = (event) => {
    // Check that click was made exactly by LBM
    if (event.buttons !== 1) { return; }

    // Get source and save it
    const source = getClosestDirectChild(this.options.container, event.target);
    if (!source) { return; }

    // Check selectors from white list
    const { whiteList } = this.options;
    if (whiteList.length) {
      if (!whiteList.some((selector) => source.matches(selector))) {
        return;
      }
    }

    this.source = source;

    // Check that further processing is allowed
    const beforeStartEvent = new BeforeStartEvent({
      source,
      originalEvent: event,
    });
    this.emit(beforeStartEvent);

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
    if (!this.isDragging()) {
      this.emit(new BeforeDragStartEvent({
        source: this.source,
        proceed: this.startDragging,
      }));
    } else {
      window.clearTimeout(this.clickTimeout);
    }
  }

  startDragging = (event) => {
    console.log('start');
    // Check if 'drag:beforeStart' event was canceled
    if (event.canceled()) {
      return this.stop();
    }

    if (this.isDragging()) {
      return;
    }

    // Set dragging flag
    this.dragging = true;

    // Todo: remove
    console.log('started dragging');

    // Create ghost and locate it
    if (this.ghost) {
      this.removeGhost();
    }

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
    if (this.dragging) {
      const dragMoveEvent = new DragMoveEvent({
        originalEvent: event,
      });
      this.emit(dragMoveEvent);

      // If event is canceled stop dragging immediately
      if (dragMoveEvent.canceled()) {
        this.stop();
        return;
      }

      // Update ghost position
      this.updateGhostPosition();
    } else {
      // Check distance from initial position and start dragging
      // even if start timeout is not over
      if (
        Math.abs(this.deltaY) >= this.options.threshold
        || Math.abs(this.deltaX) >= this.options.threshold
      ) {
        window.clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
        this.onBeforeDragStart();
      }
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

    if (!this.isDragging()) { return; }

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
    this.dragging = false;
  }

  // Utilities
  createGhost = (...args) => {
    const fn = this.options.createGhost || createGhost;
    return fn(args);
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

    this.lastEvent = null;
  }

  isDragging = () => {
    return Boolean(this.dragging);
  }
}

export default DragAndDrop;
