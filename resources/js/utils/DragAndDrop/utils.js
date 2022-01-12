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
    opacity: 0.8,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });

  return ghost;
}
