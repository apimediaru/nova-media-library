<template>
  <div class="media-uploads-browser">
    <div
        class="media-uploads-status"
    >
      <div class="media-uploads-status-processed">{{ __('Completed') }}: {{ processedCount }} / {{ totalCount }}</div>
      <div
          class="media-uploads-status-clear"
          @click="clear"
      >{{ __('Clear') }}</div>
    </div>
    <div class="media-uploads">
      <RequestListItem
        v-for="(request, i) in requests"
        :request="request"
        :name="request.name"
        :size="request.humanSize"
        :key="i"
        uploaded
      />
    </div>
    <div class="media-uploads-info">
      <div class="media-uploads-info-item media-uploads-info-item--queued">
        <span class="media-uploads-info-item-name">{{ __('In queue:') }}</span>
        <div class="media-uploads-info-item-value">{{ queuedCount }}</div>
      </div>
      <div class="media-uploads-info-item media-uploads-info-item--succeeded">
        <span class="media-uploads-info-item-name">{{ __('Succeeded:') }}</span>
        <div class="media-uploads-info-item-value">{{ succeededCount }}</div>
      </div>
      <div class="media-uploads-info-item media-uploads-info-item--failed">
        <span class="media-uploads-info-item-name">{{ __('Failed:') }}</span>
        <div class="media-uploads-info-item-value">{{ failedCount }}</div>
      </div>
    </div>
  </div>

</template>

<script>
import RequestListItem from "./RequestListItem";
import { UploadMediaRequest } from "../utils/RequestManager";

export default {
  name: "RequestList",

  components: {
    RequestListItem,
  },

  computed: {
    uploadRequests() {
      return this.requests.filter((request) => request instanceof UploadMediaRequest);
    },
    totalCount() {
      return this.uploadRequests.length;
    },
    processedCount() {
      return this.uploadRequests.filter((request) => request.isCompleted()).length;
    },
    queuedCount() {
      return this.uploadRequests.filter((request) => request.queued()).length;
    },
    succeededCount() {
      return this.uploadRequests.filter((request) => request.succeeded()).length;
    },
    failedCount() {
      return this.uploadRequests.filter((request) => request.failed()).length;
    },
  },

  props: {
    requests: {
      type: Array,
      default: () => ([]),
    },
  },

  methods: {
    clear() {
      this.$emit('clear');
    },
  },
}
</script>

<style scoped>

</style>
