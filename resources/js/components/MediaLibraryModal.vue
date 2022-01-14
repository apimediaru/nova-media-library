<template>
  <modal
      :closes-via-backdrop="closesViaBackdrop"
      closes-via-escape
      @modal-close="close"
      class="media-library-modal"
      :class="modalClass"
  >
    <div
        class="media-library-modal-frame"
        ref="container"
        :style="style"
    >
      <div class="media-library-modal-body"><slot name="container"></slot></div>

      <div class="media-library-modal-controls" v-if="$slots.buttons">
        <slot name="buttons"></slot>
      </div>
    </div>
  </modal>
</template>

<script>
export default {
  name: "MediaLibraryModal",

  props: {
    name: {
      type: String,
      default: 'modal',
      required: false,
    },
    width: {
      type: [Number, String],
      default: 600,
      required: false,
    },
    align: {
      type: String,
      default: '',
      required: false,
    },
    modalClass: {
      type: [Array, Object, String],
      default: '',
    },
    closesViaBackdrop: {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    close() {
      this.$emit('close');
    },
  },

  computed: {
    style() {
      return 'max-width: ' + this.width + 'px;';
    },
  },
}
</script>

<style lang="scss">

</style>
