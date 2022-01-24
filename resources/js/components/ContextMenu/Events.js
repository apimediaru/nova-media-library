import { AbstractEvent } from "../../shared";

export class ContextMenuEvent extends AbstractEvent {
  static type = 'contextMenu';

  /**
   * Get pointer event
   *
   * @return {PointerEvent|null}
   */
  get originalEvent() {
    return this.data.event || null;
  }
}

export class ContextMenuBeforeOpenEvent extends ContextMenuEvent {
  static type = 'contextMenu:beforeOpen';
  static cancelable = true;
}
