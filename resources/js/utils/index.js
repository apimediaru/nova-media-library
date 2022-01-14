export const keyCodes = Object.freeze({
  enter: 13,
  tab: 9,
  delete: 46,
  esc: 27,
  space: 32,
  up: 38,
  down: 40,
  left: 37,
  right: 39,
  end: 35,
  home: 36,
  del: 46,
  backspace: 8,
  insert: 45,
  pageup: 33,
  pagedown: 34,
});

export function composedPath(evt) {
  let path = (evt.composedPath && evt.composedPath()) || evt.path,
    target = evt.target

  if (path != null) {
    // Safari doesn't include Window, and it should.
    path = path.indexOf(window) < 0 ? path.concat([window]) : path
    return path
  }

  if (target === window) {
    return [window]
  }

  function getParents(node, memo) {
    memo = memo || []
    const parentNode = node.parentNode

    if (!parentNode) {
      return memo
    } else {
      return getParents(parentNode, memo.concat([parentNode]))
    }
  }

  return [target].concat(getParents(target)).concat([window])
}
