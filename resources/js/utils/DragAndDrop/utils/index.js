export { default as closest } from './closest';

export const noop = () => {};

export const getXY = (event) => {
  let { clientX, clientY } = event;
  return [ clientX, clientY ];
}

export const applyStyles = (element, styles = {}) => {
  Object.keys(styles).forEach((key) => element.style[key] = styles[key]);
}

export const applyImportantGhostStyles = (element) => {
  applyStyles(element, {
    margin: 0,
    transform: 'none',
    transition: 'none',
    position: 'absolute',
    zIndex: '999999',
  });
}

export const createGhost = (element) => {
  const rect = element.getBoundingClientRect();
  const ghost = element.cloneNode(true);
  applyImportantGhostStyles(ghost);
  applyStyles(ghost, {
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });

  return ghost;
}

export const getClosestDirectChild = (container, element) => {
  if ((!container || !element) || container === element) { return false; }

  const { children } = container;
  for (let target = element; target && target !== container; target = target.parentNode) {
    if (Array.prototype.includes.call(children, target)) {
      return target;
    }
  }

  return false;
};
