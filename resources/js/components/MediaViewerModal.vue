<template>
  <MediaLibraryModal
    closes-via-backdrop
    :width="1200"
    element-class="media-library-modal-viewport-element--gap-less"
    @modal-close="$emit('modal-close')"
  >
    <div slot="container">
      <MediaBoard
        :value="value"
      />
    </div>
  </MediaLibraryModal>
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
