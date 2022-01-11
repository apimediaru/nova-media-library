<template>
  <div
      class="media-library-thumbnail"
      :class="{
        'media-library-thumbnail-selected': selected,
        'media-library-thumbnail-disabled': !active,
        'media-library-thumbnail-highlighted': highlighted,
        'media-library-thumbnail-dragged': dragged,
      }"
      :title="name"
      @click.prevent.stop="onThumbnailClick"
  >
    <div class="media-library-thumbnail-head">
      <img src="https://picsum.photos/200/300" alt="alt" class="media-library-thumbnail-head-image" draggable="false">
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
    highlighted: Boolean,
    dragged: Boolean,
  },

  computed: {
    hasIndex() {
      return this.index !== null;
    },
  },

  methods: {
    onThumbnailClick(event) {
      this.$emit('click', event);
    },
  },
}
</script>

<style scoped>

</style>
