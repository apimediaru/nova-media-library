<template>
  <div
      class="media-library-thumbnail"
      :title="name"
  >
    <div class="media-library-thumbnail-head">
      <img src="https://picsum.photos/200/300" alt="alt" class="media-library-thumbnail-head-image">
    </div>
    <div class="media-library-thumbnail-name">
      <span
          class="media-library-thumbnail-name-index"
          v-if="hasIndex"
      >{{ index }}</span>
      <span class="media-library-thumbnail-name-value">{{ name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "MediaLibraryGalleryItem",

  props: {
    index: {
      type: [String, Number],
      default: null,
    },
    name: String,
    active: Boolean,
    selected: Boolean,
  },

  computed: {
    hasIndex() {
      return this.index !== null;
    },
  }
}
</script>

<style scoped>

</style>
