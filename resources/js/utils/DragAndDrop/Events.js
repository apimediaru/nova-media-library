import { AbstractEvent } from "../../shared";

export const DragAndDropEvents = Object.freeze({
  beforeStart: 'beforeStart',
  drag: {
    beforeStart: 'drag:beforeStart',
    start: 'drag:start',
    over: 'drag:over',
    out: 'drag:out',
    move: 'drag:move',
    drop: 'drag:drop',
  },
});

export class DragEvent extends AbstractEvent {
  static type = 'drag';

  /**
   * Source element
   * @property source
   * @type {HTMLElement}
   * @readonly
   */
  get source() {
    return this.data.source;
  }

  /**
   * Mirror element
   * @property mirror
   * @type {HTMLElement}
   * @readonly
   */
  get ghost() {
    return this.data.ghost;
  }

  /**
   * Original event that triggered sensor event
   * @property originalEvent
   * @type {Event}
   * @readonly
   */
  get originalEvent() {
    if (this.data.originalEvent) {
      return this.data.originalEvent;
    }

    return null;
  }
}

export class BeforeStartEvent extends DragEvent {
  static type = DragAndDropEvents.beforeStart;
  static cancelable = true;
}

export class BeforeDragStartEvent extends DragEvent {
  static type = DragAndDropEvents.drag.beforeStart;
  static cancellable = true;

  proceed() {
    this.data.proceed(this);
  }
}

export class DragStartEvent extends DragEvent {
  static type = DragAndDropEvents.drag.start;
  static cancellable = true;
}

class DragInstersectionEvent extends DragEvent {
  get target() {
    return this.data.target;
  }
}

export class DragOverEvent extends DragInstersectionEvent {
  static type = DragAndDropEvents.drag.over;

}

export class DragOutEvent extends DragInstersectionEvent {
  static type = DragAndDropEvents.drag.out;
}

export class DragMoveEvent extends DragEvent {
  static type = DragAndDropEvents.drag.move;
  static cancellable = true;
}

export class DragDropEvent extends DragInstersectionEvent {
  static type = DragAndDropEvents.drag.drop;
}
