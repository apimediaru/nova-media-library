<template>
  <div
      class="media-library-layout media-library-layout--view"
      v-if="hasValue"
  >
    <MediaThumbnail
        v-if="value.length"
        v-for="(file, index) in value"
        :key="index"
        :index="index"
        :name="file.file_name"
        :image="file.original_url"
        :mine-type="file.mime_type"
        :data-key="file.id"
        :active="file.active"
    />
  </div>
</template>

<script>
import MediaThumbnail from "./MediaThumbnail";

export default {
  name: "MediaBoard",

  components: {
    MediaThumbnail,
  },

  props: {
    value: {
      type: Array,
      default: () => ([]),
    },
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
