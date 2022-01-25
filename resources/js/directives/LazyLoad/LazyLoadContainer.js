import { createLazyLoadInstance } from "../../utils";

const defaultOptions = {
  threshold: 200,
  elements_selector: '[data-src]',
};

const attribute = '__LazyLoadInstance__';

const attachInstance = (el, instance) => {
  el[attribute] = instance;
}

const getInstance = (el) => {
  return el[attribute] || null;
}

const detachInstance = (el) => {
  const instance = getInstance(el);
  if (instance) {
    instance.destroy();
    delete el[attribute];
  }
}

const directive = {
  bind(el, binding) {
    attachInstance(el, createLazyLoadInstance({
      ...Object.assign({}, defaultOptions, binding.value || {}),
      container: el,
    }));
  },

  update(el, binding, VNode) {
    const instance = getInstance(el);
    if (instance) {
      VNode.context.$nextTick(() => {
        instance.update();
      });
    }
  },

  unbind(el) {
    detachInstance(el);
  },
};

export default directive;
