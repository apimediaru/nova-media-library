<template>
  <div
    class="media-upload-entry"
  >
    {{ name }}
  </div>
</template>

<script>
export default {
  name: "UploadEntry",

  props: {
    name: String,
    progress: [Number],
  },
}
</script>

<style scoped>

</style>
