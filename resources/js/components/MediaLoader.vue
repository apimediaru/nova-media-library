<template>
  <div
      class="media-browser-loader"
      v-if="loading"
  >
    <loader class="text-60" />
  </div>
</template>

<script>
export default {
  name: "MediaLoader",

  props: {
    loading: Boolean,
  },
};
</script>

<style scoped>

</style>
