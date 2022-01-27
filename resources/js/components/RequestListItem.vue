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
          v-if="request.processed()"
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
            @click="request.abort()"
        >{{ __('Abort') }}</div>
      </div>
    </div>
    <div class="media-upload-details">
      <div class="media-upload-details-size">{{ size }}</div>
      <div
          class="media-upload-details-state"
          :class="{
            'media-upload-details-state-uploaded': request.succeeded(),
            'media-upload-details-state-queued': request.queued(),
            'media-upload-details-state-failed': request.failed(),
            'media-upload-details-state-aborted': request.aborted(),
            'media-upload-details-state-processed': request.processed(),
          }"
      >
        <template v-if="request.queued() ">{{ __('Queued...') }}</template>
        <template v-else-if="request.succeeded()">{{ __('Uploaded') }}</template>
        <template v-else-if="request.processed()">{{ __('Processing...') }}</template>
        <template v-else-if="request.aborted()">{{ __('Aborted') }}</template>
        <template v-else>{{ __('Failure') }}</template>
      </div>
    </div>
    <div
        class="media-upload-information"
        v-if="request.failed() && request.response"
    >
      <span>{{ response.status }}: {{ response.statusText }}</span>
    </div>
  </div>
</template>

<script>
import { AbstractRequest } from "../shared";

export default {
  name: "RequestListItem",

  props: {
    name: String,
    size: [Number, String],
    queued: Boolean,
    uploaded: Boolean,
    request: {
      type: [AbstractRequest],
      default: () => ({}),
    },
  },

  computed: {
    progressPercentage() {
      return `${this.request.getProgress()}%`;
    },
    response() {
      return this.request.response || {};
    },
  },
}
</script>

<style scoped>

</style>
