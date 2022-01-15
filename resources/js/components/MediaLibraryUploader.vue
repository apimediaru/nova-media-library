<template>
  <transition name="fade">
    <media-library-modal
        v-if="visible"
        class="media-upload"
    >
      <div
          slot="container"
          class="library-modal-layout"
      >
        <div class="media-library-browser-head">
          <h2 class="media-library-browser-head-title">{{ __('Uploading files...') }}</h2>
        </div>

        <div class="media-upload-files library-modal-layout-scrollable">
          <UploadEntry
            v-for="(file, index) in files"
            :key="index"
            :name="file.name"
          />
        </div>
      </div>

      <div slot="buttons" class="w-full flex justify-end">
        <button
            class="btn btn-default btn-danger whitespace-no-wrap mr-4"
            type="button"
            @click="cancel"
        >
          {{ __('Cancel') }}
        </button>

        <button
            class="btn btn-default btn-primary"
            type="button"
        >
          {{ __('OK') }}
        </button>
      </div>
    </media-library-modal>
  </transition>
</template>

<script>
import MediaLibraryModal from "./MediaLibraryModal";
import UploadEntry from "./UploadEntry";

export default {
  name: "MediaLibraryUploader",

  components: {
    MediaLibraryModal,
    UploadEntry,
  },

  data() {
    return {
      visible: false,
      files: [],
      queue: [],
    }
  },

  mounted() {
    window.MediaLibraryUploader = this;
  },

  methods: {
    async upload({ resource = {}, field = {}, files = [] }) {
      if (!files.length) return;

      // this.files = Array.prototype.map.call(files, (entry) => ({
      //   name: entry.name,
      // }));
      //
      // console.log(this.files);

      this.visible = true;

      this.files = files;

      console.log(files);
    },
    cancel() {
      this.visible = false;
      this.queue = [];
      this.files = [];
    },
  },
}
</script>

<style scoped>

</style>
