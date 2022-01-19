/**
 * All library plugins inherit from this class.
 * @abstract
 * @class AbstractPlugin
 * @module AbstractPlugin
 */
export default class AbstractPlugin {
  /**
   * AbstractPlugin constructor.
   * @constructs AbstractPlugin
   * @param {DragAndDrop} dd - DragAndDrop instance
   */
  constructor(dd) {
    /**
     * DragAndDrop instance
     * @property dd
     * @type {DragAndDrop}
     */
    this.dd = dd;
  }

  /**
   * Override to add listeners
   * @abstract
   */
  attach() {
    throw new Error('Not Implemented');
  }

  /**
   * Override to remove listeners
   * @abstract
   */
  detach() {
    throw new Error('Not Implemented');
  }
}
