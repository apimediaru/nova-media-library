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
        <div
            class="media-library-layout"
            :class="{
              'media-library-layout-hidden': !isInBrowsingMode || isDragging,
            }"
        >
          <div
              v-if="!filesNotEmpty"
              class="media-library-layout-message"
          >
            {{ __('There are currently no media files in this library') }}
          </div>
          <MediaLibraryThumbnail
            v-else
            v-for="(file, index) in files"
            :key="index"
            :index="index"
            :name="file.name"
          />
        </div>

        <div
            class="media-library-dropzone"
            :class="{
              'media-library-dropzone-visible': isDropzoneVisible,
              'media-library-dropzone-highlighted': isDraggingOverDropzone,
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
          <input
              type="file"
              multiple
              class="media-library-dropzone-input"
              ref="upload"
              @change="onFileInputChange"
          >
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
import MediaLibraryThumbnail from "./MediaLibraryThumbnail";

const { throttle, debounce } = window._;

const MODES = Object.freeze({
  BROWSING: 0,
  UPLOADING: 1,
});

export default {
  name: "MediaLibraryBrowser",

  components: {
    MediaLibraryModal,
    MediaLibraryThumbnail,
  },

  data() {
    return {
      mode: MODES.BROWSING,
      isDragging: false,
      isDraggingOverDropzone: false,
      endDragging: false,

      // Prevent any upload and reorder interactive actions
      inactive: false,

      // Uploaded files
      files: [],

      // Queue of files to upload
      queue: [],
    };
  },

  props: {
    field: {
      type: Object,
      default: () => ({}),
    },
  },

  mounted() {
    this.addDragAndDropEventListeners();
  },

  beforeDestroy() {
    this.removeDragAndDropEventListeners();
  },

  computed: {
    isInBrowsingMode() {
      return this.mode === MODES.BROWSING;
    },
    isInUploadingMode() {
      return this.mode === MODES.UPLOADING;
    },
    isDropzoneVisible() {
      return this.isInUploadingMode || this.isDragging;
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

    // Files
    addFile(file) {
      this.files.push(file);
    },

    // File input
    getUploadInput() {
      return this.$refs.upload;
    },
    onFileInputChange(event) {
      console.log(event);
      const { files } = this.getUploadInput();

      Array.prototype.forEach.call(files, (file) => {
        this.addFile(file);
      });
    },

    // Drag and drop
    addDragAndDropEventListeners() {
      window.addEventListener('drop', this.onDrop);
      window.addEventListener('dragover', this.onDragMove);
      window.addEventListener('dragleave', this.onDragMove);
      window.addEventListener('dragend', this.onDragEnd);
    },
    removeDragAndDropEventListeners() {
      window.removeEventListener('drop', this.onDrop);
      window.removeEventListener('dragover', this.onDragMove);
      window.removeEventListener('dragleave', this.onDragMove);
      window.removeEventListener('dragend', this.onDragEnd);
    },
    onDrop(event) {
      if (!this.dropzoneIncludes(event.target)) {
        event.preventDefault();
      }

      this.isDragging = false;
    },
    onDragMove: function (event) {
      event.preventDefault();

      const dropzoneOverlapped = this.dropzoneIncludes(event.target);

      if (event.type === 'dragleave' && !dropzoneOverlapped) {
        this.endDragging = true;
        this.enforceDragEnd();
      } else {
        this.isDragging = true;
        this.endDragging = false;
        this.isDraggingOverDropzone = dropzoneOverlapped;
      }
    },
    onDragEnd() {
      this.isDragging = false;
    },
    enforceDragEnd: debounce(function (force = false) {
      if (this.endDragging || force) {
        this.isDragging = false;
        this.isDraggingOverDropzone = false;
      }
    }, 200),
    dropzoneIncludes(element) {
      return element && element.matches('.media-library-dropzone-input');
    },
  },
}
</script>

<style scoped>

</style>
