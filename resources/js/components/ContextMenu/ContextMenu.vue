<template>
  <div
    class="context-menu"
    ref="menu"
    tabindex="-1"
    v-if="visible"
    v-click-outside="onClickOutside"
  >
    <slot :context="context" />
  </div>
</template>

<script>
import { computePosition, shift, flip, offset } from '@floating-ui/dom';
import { ClickOutside } from "../../directives";
import { ContextMenuBeforeOpenEvent } from "./Events";

export default {
  name: "ContextMenu",

  directives: {
    ClickOutside,
  },

  data: () => ({
    visible: false,
  }),

  props: {
    placement: {
      type: String,
      default: 'bottom-start',
    },
    offset: {
      type: Object,
      default: () => ({
        mainAxis: 10,
        crossAxis: 15,
      }),
    },
    reference: {
      type: Function,
      default: () => document.documentElement,
    },
    disabled: Boolean,
  },

  computed: {
    context() {
      return {
        hide: this.hide,
      }
    },
  },

  mounted() {
    this.getReference().addEventListener('contextmenu', this.onContextMenu, true);
  },

  beforeDestroy() {
    this.getReference().removeEventListener('contextmenu', this.onContextMenu, true);
  },

  methods: {
    getFloating() {
      return this.$refs.menu;
    },
    getReference() {
      return this.reference();
    },
    hide() {
      this.visible = false;
    },
    show() {
      this.visible = true;
    },
    onDragStart() {
      this.hide();
    },
    onClickOutside() {
      if (this.visible) {
        this.hide();
      }
    },
    spot({ x, y }) {
      Object.assign(this.getFloating().style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    },
    async onContextMenu(event) {
      event.preventDefault();

      if (this.disabled) {
        return;
      }

      const contextMenuBeforeOpenEvent = new ContextMenuBeforeOpenEvent({
        event,
      });
      this.$emit('before-open', contextMenuBeforeOpenEvent);
      if (contextMenuBeforeOpenEvent.canceled()) {
        this.hide();
        return;
      }

      if (!this.visible) {
        this.show();
      }

      this.$nextTick(() => {
        const { clientX, clientY } = event;
        const virtualEl = {
          getBoundingClientRect() {
            return {
              width: 0,
              height: 0,
              x: clientX,
              y: clientY,
              top: clientY,
              left: clientX,
              right: clientX,
              bottom: clientY,
            };
          },
        };
        computePosition(virtualEl, this.getFloating(), {
          placement: this.placement,
          middleware: [
            flip(),
            shift({
              rootBoundary: this.getReference(),
            }),
            offset(10),
          ],
        }).then(this.spot);
        this.getFloating().style.visibility = 'visible';
      });
    },
  },
}
</script>

<style scoped>

</style>
