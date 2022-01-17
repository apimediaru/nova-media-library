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
      <div class="media-upload-details-size">{{ size }}</div>
      <div
          class="media-upload-details-state"
          :class="{
            'media-upload-details-state-uploaded': media.uploaded(),
            'media-upload-details-state-queued': media.queued(),
            'media-upload-details-state-failed': media.failed(),
          }"
      >
        <template v-if="media.queued() ">{{ __('Queued...') }}</template>
        <template v-else-if="media.uploaded()">{{ __('Uploaded') }}</template>
        <template v-else>{{ __('Failed') }}</template>
      </div>
    </div>
  </div>
</template>

<script>
import { MediaUpload } from "../utils/MediaUploader";

export default {
  name: "UploadsListItem",

  props: {
    name: String,
    size: Number,
    queued: Boolean,
    uploaded: Boolean,
    media: {
      type: [MediaUpload],
      default: () => ({}),
    },
  },

  watch: {
    'media.response'(val) {
      console.log(val);
    },
  },
}
</script>

<style scoped>

</style>
