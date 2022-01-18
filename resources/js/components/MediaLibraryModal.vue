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
        v-on-clickaway="backdropClose"
      >
        <div class="media-library-modal-viewport-element-body">
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
          @click="backdropClose"
        >
          <IconCross />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconCross from "./Icons/IconCross";
import { mixin as clickaway } from 'vue-clickaway';
import { composedPath } from '../utils';

export default {
  name: "MediaLibraryModal",

  mixins: [clickaway],

  components: {
    IconCross,
  },

  props: {
    classWhitelist: [Array, String],

    elementClass: [Array, String],

    closesViaEscape: {
      type: Boolean,
      default: true,
    },

    closesViaBackdrop: {
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
