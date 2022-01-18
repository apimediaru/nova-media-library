<template>
  <div
      class="media-library-thumbnail"
      :class="{
        'media-library-thumbnail--selected': selected,
        'media-library-thumbnail--disabled': !active,
        'media-library-thumbnail--highlighted': highlighted,
        'media-library-thumbnail--dragged': dragged,
        'media-library-thumbnail--intersected': intersected,
      }"
      :title="name"
      v-on="listeners"
      :data-extension="extension"
  >
    <div class="media-library-thumbnail-head">
      <img
          :src="image"
          :alt="name"
          class="media-library-thumbnail-head-image"
          draggable="false"
      >
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
  name: "MediaThumbnail",

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
    processContextMenu: Boolean,
    intersected: Boolean,
    mineType: String,
    image: String,
  },

  computed: {
    hasIndex() {
      return this.index !== null;
    },
    listeners() {
      const listeners = {
        click: this.onThumbnailClick,
      };
      const providedListeners = this.$listeners;
      if (providedListeners.contextmenu) {
        listeners.contextmenu = this.onContextMenu;
      }
      return listeners;
    },
    extension() {
      switch (this.mineType) {
        case 'image/png': {
          return 'png';
        }
        default: {
          return null;
        }
      }
    },
  },

  methods: {
    onThumbnailClick(event) {
      event.preventDefault();
      event.stopPropagation();
      this.$emit('click', event);
    },
    onContextMenu(event) {
      event.preventDefault();
      this.$emit('contextmenu', event);
      return false;
    },
  },
}
</script>

<style scoped>

</style>
