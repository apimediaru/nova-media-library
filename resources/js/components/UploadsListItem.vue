<template>
  <div
      class="media-upload"
      :class="{
        'media-upload--uploaded': uploaded,
        'media-upload--queued': queued,
        'media-upload--failed': !uploaded && !queued,
      }"
      :title="name"
  >
    <div class="media-upload-info">
      <div class="media-upload-info-name">{{ name }}</div>

    </div>
    <div class="media-upload-details">
      <div class="media-upload-details-size">{{ sizeHuman }}</div>
      <div
          class="media-upload-details-state"
          :class="{
            'media-upload-details-state-uploaded': uploaded,
            'media-upload-details-state-queued': queued,
            'media-upload-details-state-failed': !uploaded && !queued,
          }"
      >
        <template v-if="queued">{{ __('Queued...') }}</template>
        <template v-else-if="uploaded">{{ __('Uploaded') }}</template>
        <template v-else>{{ __('Failed') }}</template>
      </div>
    </div>
  </div>
</template>

<script>
import fileSize from 'filesize/lib/filesize.es6';

export default {
  name: "UploadsListItem",

  props: {
    name: String,
    size: Number,
    queued: Boolean,
    uploaded: Boolean,
  },

  computed: {
    sizeHuman() {
      return fileSize(this.size);
    },
  },
}
</script>

<style scoped>

</style>
