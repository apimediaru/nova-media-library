<template>
  <MediaLibraryModal
    @close="close"
    modal-class="media-library-browser"
    width="1400"
  >
    <div
        slot="container"
        class="media-library-browser-container"
    >
      <h2 class="text-90 font-normal text-xl mb-6">
        <span>{{ __('Browse media library') }}<template v-if="field.name">: {{ field.name }}</template></span>
      </h2>

      <div
          class="media-library-browser-area"
      >
        <div class="media-library-layout">
          <div
              v-if="!filesNotEmpty"
          >
            {{ __('Media was not found') }}
          </div>
        </div>

        <div
            class="media-library-dropzone"
            :class="{
              'media-library-dropzone-visible': isDropzoneVisible,
            }"
        >
          <p class="media-library-dropzone-icon">
            <svg class="fill-current w-4 h-4 mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
            </svg>
          </p>
          <p class="media-library-dropzone-notice">
            {{ __('Drop your images here, or click to browse') }}
          </p>
          <input type="file" multiple class="media-library-dropzone-input">
        </div>
      </div>
    </div>

    <div slot="buttons" class="w-full flex">
      <button
          class="btn btn-default btn-primary whitespace-no-wrap"
          type="button"
          v-if="isInBrowsingMode"
          @click="setUploadingMode"
      >
        {{ __('Upload files') }}
      </button>
      <button
          class="btn btn-default btn-primary whitespace-no-wrap"
          type="button"
          v-if="isInUploadingMode"
          @click="setBrowsingMode"
      >
        {{ __('Back') }}
      </button>

      <div class="flex w-full justify-end">
        <button
            class="btn btn-default btn-danger"
            type="button"
            @click.prevent="close"
        >
          {{ __('Close') }}
        </button>
      </div>
    </div>
  </MediaLibraryModal>
</template>

<script>
import MediaLibraryModal from "./MediaLibraryModal";

const MODES = Object.freeze({
  BROWSING: 0,
  UPLOADING: 1,
});

export default {
  name: "MediaLibraryBrowser",

  components: {
    MediaLibraryModal,
  },

  data() {
    return {
      mode: MODES.BROWSING,
      files: [],
    };
  },

  props: {
    field: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    isInBrowsingMode() {
      return this.mode === MODES.BROWSING;
    },
    isInUploadingMode() {
      return this.mode === MODES.UPLOADING;
    },
    isDropzoneVisible() {
      return this.isInUploadingMode;
    },
    filesNotEmpty() {
      return this.files.length > 0;
    },
  },

  methods: {
    close() {
      this.$emit('close');
    },

    setUploadingMode() {
      this.mode = MODES.UPLOADING;
    },
    setBrowsingMode() {
      this.mode = MODES.BROWSING;
    },
  },
}
</script>

<style scoped>

</style>
