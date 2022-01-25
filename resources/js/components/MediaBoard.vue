<template>
  <div class="media-board">
    <div
        class="media-browser-loader"
        v-if="loading"
    >
      <loader class="text-60" />
    </div>

    <div
        class="media-library-layout"
        v-if="hasValue"
        v-lazy-load-container
    >
      <MediaThumbnail
          v-if="value.length"
          v-for="(file, index) in value"
          :key="file.id"
          :index="file.order_column"
          :name="file.file_name"
          :image="file.original_url"
          :mine-type="file.mime_type"
          :data-key="file.id"
          :active="file.active"
      />
    </div>
  </div>
</template>

<script>
import MediaThumbnail from "./MediaThumbnail";
import MediaLoader from "./MediaLoader";
import { LazyLoadContainer } from "../directives";

export default {
  name: "MediaBoard",

  directives: {
    LazyLoadContainer,
  },

  components: {
    MediaThumbnail,
    MediaLoader,
  },

  props: {
    value: {
      type: Array,
      default: () => ([]),
    },
    loading: Boolean,
  },

  computed: {
    hasValue() {
      return this.value.length > 0;
    },
  },
};
</script>

<style scoped>

</style>
