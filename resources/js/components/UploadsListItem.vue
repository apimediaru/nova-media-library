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
      <div
          class="media-upload-info-progress"
          v-if="media.processed()"
      >
        <div
            class="media-upload-info-progress-bar media-upload-progress"
            :title="progressPercentage"
        >
          <div
              class="media-upload-progress-foreground"
              :style="{
                width: progressPercentage
              }"
          />
        </div>
        <div
            class="media-upload-info-progress-abort"
            @click="media.interrupt()"
        >{{ __('Abort') }}</div>
      </div>
    </div>
    <div class="media-upload-details">
      <div class="media-upload-details-size">{{ size }}</div>
      <div
          class="media-upload-details-state"
          :class="{
            'media-upload-details-state-uploaded': media.succeeded(),
            'media-upload-details-state-queued': media.queued(),
            'media-upload-details-state-failed': media.failed(),
            'media-upload-details-state-aborted': media.aborted(),
            'media-upload-details-state-processed': media.processed(),
          }"
      >
        <template v-if="media.queued() ">{{ __('Queued...') }}</template>
        <template v-else-if="media.succeeded()">{{ __('Uploaded') }}</template>
        <template v-else-if="media.processed()">{{ __('Processing...') }}</template>
        <template v-else-if="media.aborted()">{{ __('Aborted') }}</template>
        <template v-else>{{ __('Failed') }}</template>
      </div>
    </div>
    <div
        class="media-upload-information"
        v-if="media.failed() && media.response"
    >
      <span>{{ response.status }}: {{ response.statusText }}</span>
    </div>
  </div>
</template>

<script>
import { MediaUpload } from "../utils/MediaUploader";

export default {
  name: "UploadsListItem",

  props: {
    name: String,
    size: [Number, String],
    queued: Boolean,
    uploaded: Boolean,
    media: {
      type: [MediaUpload],
      default: () => ({}),
    },
  },

  computed: {
    progressPercentage() {
      return `${this.media.getProgress()}%`;
    },
    response() {
      return this.media.getResponse();
    },
  },
}
</script>

<style scoped>

</style>
