<template>
  <media-library-modal
    closes-via-backdrop
    :width="1200"
    element-class="media-library-modal-viewport-element--gap-less"
    @modal-close="$emit('modal-close')"
  >
    <div slot="container">
      <media-board
        class="media-board--viewer"
        :value="value"
      />
    </div>
  </media-library-modal>
</template>

<script>
import MediaLibraryModal from "./MediaLibraryModal";
import MediaBoard from "./MediaBoard";

export default {
  name: "MediaBoardModel",

  components: {
    MediaLibraryModal,
    MediaBoard,
  },

  props: {
    value: {
      type: Array,
      default: () => ({}),
    },
  },
}
</script>

<style scoped>

</style>
