/**
 * Taken from Vuetify and modified to use in non-vuetify application environment
 * @link https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/directives/click-outside/index.ts Source code
 * @link https://vuetifyjs.com/en/directives/click-outside/#usage API Documentation
 */

function defaultConditional () {
  return true;
}

function directive (e, el, binding) {
  const handler = typeof binding.value === 'function' ? binding.value : binding.value.handler;

  const isActive = (typeof binding.value === 'object' && binding.value.closeConditional) || defaultConditional;

  // The include element callbacks below can be expensive
  // so we should avoid calling them when we're not active.
  // Explicitly check for false to allow fallback compatibility
  // with non-toggleable components
  if (!e || isActive(e) === false) return;

  // Check if additional elements were passed to be included in check
  // (click must be outside all included elements, if any)
  const elements = ((typeof binding.value === 'object' && binding.value.include) || (() => []))();
  // Add the root element for the component this directive was defined on
  elements.push(el);

  // Check if it's a click outside our elements, and then if our callback returns true.
  // Non-toggleable components should take action in their callback and return falsy.
  // Toggleable can return true if it wants to deactivate.
  // Note that, because we're in the capture phase, this callback will occur before
  // the bubbling click event on any outside elements.
  !elements.some((el) => el.contains(e.target))
  && setTimeout(() => {
    isActive(e) && handler && handler(e);
  }, 0);
}

export const ClickOutside = {
  // [data-app] may not be found
  // if using bind, inserted makes
  // sure that the root element is
  // available, iOS does not support
  // clicks on body
  inserted (el, binding) {
    const onClick = (e) => directive(e, el, binding);
    // iOS does not recognize click events on document
    // or body, this is the entire purpose of the v-app
    // component and [data-app], stop removing this
    const app = document.body;
    app.addEventListener('mousedown', onClick, true);
    el._clickOutside = onClick;
  },

  unbind (el) {
    if (!el._clickOutside) return;

    const app = document.body;
    if (app) {
      app.removeEventListener('mousedown', el._clickOutside, true);
    }
    delete el._clickOutside;
  },
};

export default ClickOutside;
