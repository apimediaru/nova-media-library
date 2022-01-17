<template>
  <div class="media-uploads-browser">
    <div
        class="media-uploads-status"
    >{{ __('Processed') }}: 5 / 12</div>
    <div class="media-uploads">
      <UploadsListItem
          v-for="i in 100"
          name="testadsasdasdasdasd adas asdd asdasdasdas asdasdasd asdas"
          :size="1214124"
          :key="i"
          uploaded
      />
    </div>
    <div class="media-uploads-info">
      <div class="media-uploads-info-item media-uploads-info-item--queued">
        <span class="media-uploads-info-item-name">{{ 'In queue' }}:</span>
        <div class="media-uploads-info-item-value">2</div>
      </div>
      <div class="media-uploads-info-item media-uploads-info-item--succeeded">
        <span class="media-uploads-info-item-name">{{ 'Succeeded' }}:</span>
        <div class="media-uploads-info-item-value">2</div>
      </div>
      <div class="media-uploads-info-item media-uploads-info-item--failed">
        <span class="media-uploads-info-item-name">{{ 'Failed' }}:</span>
        <div class="media-uploads-info-item-value">0</div>
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
  }
}
</script>

<style scoped>

</style>
