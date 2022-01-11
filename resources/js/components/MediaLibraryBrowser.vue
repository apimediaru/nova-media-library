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
      <div class="media-library-browser-head">
        <h2 class="media-library-browser-head-title">
          <span>{{ __('Browse media library') }}<template v-if="field.name">: {{ field.name }}</template></span>
        </h2>

        <div
            class="media-library-panel-actions"
            :class="{
              'media-library-panel-actions-disabled': !selected.length,
              'media-library-panel-actions-hidden': !files.length,
            }"
        >
          <div class="media-library-panel-actions-actions media-library-actions">
            <div class="media-library-actions-action media-library-action">
              <select
                  class="w-full form-control form-select cursor-pointer"
                  :disabled="!selected.length"
                  v-model="action"
              >
                <option value="none" selected>{{ __('Select an action') }}</option>
                <option value="remove">{{ __('Remove') }}</option>
                <option value="makeActive">{{ __('Make active') }}</option>
                <option value="makeInactive">{{ __('Make inactive') }}</option>
                <option value="regenerateThumbnails">{{ __('Regenerate thumbnails') }}</option>
              </select>
            </div>
            <div class="media-library-actions-action media-library-action">
              <button
                  class="btn btn-default btn-primary whitespace-no-wrap cursor-pointer"
                  :disabled="action === 'none'"
              >{{ __('Apply') }}</button>
            </div>
            <div class="media-library-actions-action media-library-action media-library-action-select-all">
              <span
                  class="media-library-action-select-all-positive text-primary dim no-underline cursor-pointer"
                  @click="selectAll"
                  v-if="files.length !== selected.length"
              >
                {{ __('Select all') }}
              </span>
              <span
                  class="media-library-action-select-all-negative text-primary dim no-underline cursor-pointer"
                  @click="unselectAll"
                  v-if="selected.length > 0"
              >
                {{ __('Unselect all') }}
              </span>
            </div>
          </div>
          <div class="media-library-browser-actions-action-search">
            <input
                type="text"
                class="w-full form-control form-input form-input-bordered"
                :placeholder="__('Search...')"
            >
          </div>
          <div
              class="media-library-browser-actions-action-for-selected"
              v-if="files.length > 0"
          >
            {{ __('Selected:') }} <span class="media-library-browser-actions-action-for-selected-value">{{ selected.length }} / {{ files.length }}</span>
          </div>
        </div>
      </div>

      <div
          class="media-library-browser-area"
          @click="unselectAll"
      >
        <div
            class="media-library-layout"
            :class="{
              'media-library-layout-hidden': !isInBrowsingMode || isDragging,
            }"
            ref="layout"
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
            @click="onThumbnailClick(index, $event)"
            :dragged="isReordering && selected.includes(index)"
            :selected="isItemSelected(index)"
            :highlighted="index === selectedIndex"
            :data-id="index"
            active
          />
        </div>

        <div
            class="media-library-dropzone"
            :class="{
              'media-library-dropzone-visible': isDropzoneVisible,
              'media-library-dropzone-highlighted': isDropzoneVisible && isDraggingOverDropzone,
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

import DragAndDrop from "../utils/DragAndDrop";


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
      isDragAndDropEnabled: true,
      isDraggingOverDropzone: false,
      ghost: null,
      endDragging: false,

      // Sortable drag and drop
      sortable: null,
      isReordering: false,

      // Prevent any upload and reorder interactive actions
      inactive: false,

      // Uploaded files
      files: [],

      // Queue of files to upload
      queue: [],

      // Array of selected files IDs
      selected: [],
      selectedIndex: null,

      action: 'none',
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
    // this.registerSortable();
  },

  beforeDestroy() {
    this.removeDragAndDropEventListeners();
    this.destroySortable();
  },

  computed: {
    isInBrowsingMode() {
      return this.mode === MODES.BROWSING;
    },
    isInUploadingMode() {
      return this.mode === MODES.UPLOADING;
    },
    isDropzoneVisible() {
      return this.isDragAndDropEnabled && (this.isInUploadingMode || this.isDragging);
    },
    filesNotEmpty() {
      return this.files.length > 0;
    },
  },

  methods: {
    // Todo: move
    onThumbnailClick(index, event) {
      const { shiftKey, ctrlKey } = event;
      if (shiftKey && ctrlKey) {
        this.selectRange(this.selectedIndex, index, true);
      } else if (shiftKey) {
        this.selectRange(this.selectedIndex, index);
      } else if (ctrlKey) {
        this.setSelectedIndex(index);
        this.toggleSelection(index);
      } else {
        this.beginSelection(index);
      }
    },

    close() {
      this.$emit('close');
    },

    setUploadingMode() {
      this.mode = MODES.UPLOADING;
    },
    setBrowsingMode() {
      this.mode = MODES.BROWSING;
    },

    // Selected files
    beginSelection(id) {
      this.unselectAll();
      this.addSelection(id);
      this.setSelectedIndex(id);
    },
    setSelectedIndex(id) {
      this.selectedIndex = Number(id);
    },
    selectRange(start, end, keep = false) {
      const selected = keep ? Array.from(this.selected) : [];
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        selected.push(i);
      }
      this.selected = Array.from(new Set(selected));
    },
    toggleSelection(id) {
      const i = Number(id);
      if (this.isItemSelected(i)) {
        this.removeSelection(i);
      } else {
        this.addSelection(i);
      }
    },
    isItemSelected(id) {
      return this.selected.includes(Number(id));
    },
    removeSelection(id) {
      this.selected = this.selected.filter((item) => item !== Number(id));
    },
    addSelection(id) {
      this.selected.push(Number(id));
    },
    toggleSelectAll() {
      if (this.files.length !== this.selected.length) {
        this.selectAll();
      } else {
        this.unselectAll();
      }
    },
    selectAll() {
      // TODO: index => id
      this.selected = this.files.map((file, index) => index);
    },
    unselectAll() {
      this.selected = [];
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

      this.setBrowsingMode();
    },

    // Drag and drop
    disableDragAndDrop() {
      this.isDragAndDropEnabled = false;
    },
    enableDragAndDrop() {
      this.isDragAndDropEnabled = true;
    },
    addDragAndDropEventListeners() {
      window.addEventListener('drop', this.onDrop);
      window.addEventListener('dragover', this.onDragMove);
      window.addEventListener('dragleave', this.onDragMove);
      window.addEventListener('dragend', this.onDragEnd);
      document.addEventListener('keydown', this.onKeyDown);
    },
    removeDragAndDropEventListeners() {
      window.removeEventListener('drop', this.onDrop);
      window.removeEventListener('dragover', this.onDragMove);
      window.removeEventListener('dragleave', this.onDragMove);
      window.removeEventListener('dragend', this.onDragEnd);
      document.removeEventListener('keydown', this.onKeyDown);
    },
    onKeyDown(event) {
      const { keyCode } = event;
      // Check for "A" key
      if (event.ctrlKey && keyCode === 65) {
        event.preventDefault();
        this.toggleSelectAll();
        return false;
      }
    },
    onDrop(event) {
      if (!this.dropzoneIncludes(event.target)) {
        event.preventDefault();
      }

      this.isDragging = false;
    },
    onDragMove: function (event) {
      if (!this.isDragAndDropEnabled) { return; }

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

    // Sortable
    // registerSortable() {
    //   this.sortable = new DragAndDrop(this.$refs.layout, {
    //     on: {
    //       dragStart: (el) => {
    //         console.log(el);
    //         this.isReordering = true;
    //         const { id } = el.dataset;
    //         this.addSelection(id);
    //       },
    //       dragEnd: () => {
    //         this.isReordering = false;
    //       },
    //     },
    //   });
    //   // this.$refs.layout.addEventListener('dragstart', this.onThumbnailDragStart);
    // },
    destroySortable() {
      this.sortable.destroy();
    },
    // createDragAndDropGhost(element) {
    //   const rect = element.getBoundingClientRect();
    //   const ghost = element.cloneNode(true);
    //
    //   const styles = {
    //     margin: 0,
    //     transform: 'none',
    //     transition: 'none',
    //     opacity: 0.8,
    //     position: 'absolute',
    //     width: `${rect.width}px`,
    //     height: `${rect.height}px`,
    //     // top: `${window.scrollY + rect.top}px`,
    //     // left: `${rect.left}px`,
    //     zIndex: '999999',
    //   };
    //   Object.keys(styles).forEach((key) => ghost.style[key] = styles[key]);
    //
    //   return ghost;
    // },
    // onThumbnailDragStart(event) {
    //   this.disableDragAndDrop();
    //   const { target } = event;
    //   const thumbnail = target.closest('.media-library-thumbnail');
    //
    //   const ghost = this.createDragAndDropGhost(thumbnail);
    //   this.ghost = ghost;
    //   document.body.appendChild(ghost);
    //   event.dataTransfer.setDragImage(ghost, event.offsetX, event.offsetY);
    //
    //
    //   // thumbnail.addEventListener('dragend', this.onThumbnailDragEnd);
    //   // const { node, event } = payload;
    //   // this.disableDragAndDrop();
    //   // const ghost = this.createDragAndDropGhost(node.$el);
    //   // this.ghost = ghost;
    //   // document.body.appendChild(ghost);
    //   // event.dataTransfer.setDragImage(ghost, 0, 0);
    // },
    // onThumbnailDragEnd(event) {
    //   console.log('dragend');
    //   const { target } = event;
    //   const thumbnail = target.closest('.media-library-thumbnail');
    //   thumbnail.removeEventListener('dragend', this.onDragEnd);
    //   this.ghost.remove();
    //   this.enableDragAndDrop();
    // },
  },

  watch: {
    selected(value) {
      if (!value.length) {
        this.selectedIndex = null;
      }
    },
  },
}
</script>

<style scoped>

</style>
