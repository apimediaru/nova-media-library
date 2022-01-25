<template>
  <div
      class="media-library-modal"
  >
    <div class="media-library-modal-backdrop" />
    <div class="media-library-modal-viewport">
      <div
        class="media-library-modal-viewport-element"
        :style="style"
        :class="[
          elementClass,
          {
            'media-library-modal-viewport-element--has-controls': !!$slots.buttons,
          },
        ]"
        v-click-outside="backdropClose"
      >
        <div
          class="media-library-modal-viewport-element-body"
          :class="elementBodyClass"
        >
          <slot name="container" />
        </div>
        <div
            class="media-library-modal-viewport-element-controls"
            v-if="$slots.buttons"
        >
          <slot name="buttons" />
        </div>
        <div
          class="media-library-modal-viewport-element-close"
          @click="crossClose"
        >
          <IconCross />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconCross from "./Icons/IconCross";
import { composedPath } from '../utils';
import { ClickOutside } from "../directives";

export default {
  name: "MediaLibraryModal",

  directives: {
    ClickOutside,
  },

  components: {
    IconCross,
  },

  props: {
    classWhitelist: [Array, String],

    elementClass: [Array, String, Object],

    elementBodyClass: [Array, String, Object],

    closesViaEscape: {
      type: Boolean,
      default: true,
    },

    closesViaBackdrop: {
      type: [Boolean, Function],
      default: true,
    },

    closesViaCross: {
      type: [Boolean, Function],
      default: true,
    },

    paused: Boolean,

    width: {
      type: [Number, String],
      default: 600,
      required: false,
    },
  },

  created() {
    document.addEventListener('keydown', this.handleEscape);
    if (document.body.classList.contains('media-library-open')) {
      this.nested = true;
    } else {
      document.body.classList.add('media-library-open', 'overflow-hidden');
    }
  },

  data() {
    return {
      nested: false,
    };
  },

  mounted() {
    Nova.pauseShortcuts();
  },

  destroyed() {
    document.removeEventListener('keydown', this.handleEscape);
    if (!this.nested) {
      document.body.classList.remove('media-library-open', 'overflow-hidden');
    }

    Nova.resumeShortcuts();
  },

  computed: {
    style() {
      return 'max-width: ' + this.width + 'px;';
    },
  },

  methods: {
    handleEscape(e) {
      if (this.paused) { return; }

      e.stopPropagation();

      if (e.keyCode == 27 && this.closesViaEscape === true) {
        this.close(e);
      }
    },

    backdropClose(e) {
      if (!e.isTrusted || this.paused) return;

      if (typeof this.closesViaBackdrop === 'function' && this.closesViaBackdrop()) {
        this.close(e);
        return;
      }

      let classArray = Array.isArray(this.classWhitelist)
          ? this.classWhitelist
          : [this.classWhitelist];

      if (
          _.filter(classArray, className => pathIncludesClass(e, className))
              .length > 0
      ) {
        return;
      }
      if (this.closesViaBackdrop === true) {
        this.close(e);
      }
    },

    crossClose(e) {
      if (typeof this.closesViaCross === 'function' && this.closesViaCross()) {
        this.close(e);
        return;
      }

      if (this.closesViaCross) {
        this.close(e);
      }
    },

    close(e) {
      this.$emit('modal-close', e);
    },
  },
}

function pathIncludesClass(event, className) {
  return composedPath(event)
      .filter(el => el !== document && el !== window)
      .reduce((acc, e) => acc.concat([...e.classList]), [])
      .includes(className);
}
</script>
