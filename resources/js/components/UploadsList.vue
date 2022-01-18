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
      <UploadsListItem
          v-for="(upload, i) in uploads"
          :media="upload"
          :name="upload.name"
          :size="upload.humanSize"
          :key="i"
          uploaded
      />
    </div>
    <div class="media-uploads-info">
      <div class="media-uploads-info-item media-uploads-info-item--queued">
        <span class="media-uploads-info-item-name">{{ 'In queue' }}:</span>
        <div class="media-uploads-info-item-value">{{ queuedCount }}</div>
      </div>
      <div class="media-uploads-info-item media-uploads-info-item--succeeded">
        <span class="media-uploads-info-item-name">{{ 'Succeeded' }}:</span>
        <div class="media-uploads-info-item-value">{{ succeededCount }}</div>
      </div>
      <div class="media-uploads-info-item media-uploads-info-item--failed">
        <span class="media-uploads-info-item-name">{{ 'Failed' }}:</span>
        <div class="media-uploads-info-item-value">{{ failedCount }}</div>
      </div>
    </div>
  </div>

</template>

<script>
import UploadsListItem from "./UploadsListItem";
export default {
  name: "UploadsList",

  components: {
    UploadsListItem,
  },

  computed: {
    totalCount() {
      return this.uploads.length;
    },
    processedCount() {
      return this.uploads.filter((upload) => upload.isCompleted()).length;
    },
    queuedCount() {
      return this.uploads.filter((upload) => upload.queued()).length;
    },
    succeededCount() {
      return this.uploads.filter((upload) => upload.succeeded()).length;
    },
    failedCount() {
      return this.uploads.filter((upload) => upload.failed()).length;
    },
  },

  props: {
    uploads: {
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
