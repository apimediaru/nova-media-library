<template>
  <MediaLibraryModal
    @close="close"
    :closes-via-backdrop="closesViaBackdrop"
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
              'media-library-panel-actions-disabled': !selectedCount,
              'media-library-panel-actions-hidden': !files.length,
            }"
        >
          <div class="media-library-panel-actions-actions media-library-actions">
            <div class="media-library-actions-action media-library-action">
              <select
                  class="w-full form-control form-select cursor-pointer"
                  :disabled="!selectedCount"
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
                  v-if="files.length !== selectedCount"
              >
                {{ __('Select all') }}
              </span>
              <span
                  class="media-library-action-select-all-negative text-primary dim no-underline cursor-pointer"
                  @click="unselectAll"
                  v-if="selectedCount"
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
            {{ __('Selected:') }} <span class="media-library-browser-actions-action-for-selected-value">{{ selectedCount }} / {{ files.length }}</span>
          </div>
        </div>
      </div>

      <div
          class="media-library-browser-area"
          @click="onBrowserAreaClick"
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
            ref="thumbnail"
            :highlighted="index === selectedIndex"
            :intersected="index === reorderIntersectionId"
            :data-key="index"
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

const bodyLockedClass = 'media-library-locked';

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
      reorderIntersectionId: null,

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

      // Prevent next click on layout grid
      isBrowserAreaClickPrevented: false,

      // Modal props
      closesViaBackdrop: true,
    };
  },

  props: {
    field: {
      type: Object,
      default: () => ({}),
    },
  },

  mounted() {
    this.fakeFiles();
    this.addDragAndDropEventListeners();
    this.registerSortable();
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
    selectedCount() {
      return this.selected.length;
    },
    filesCount() {
      return this.files.length;
    },
    canBeSorted() {
      return this.selectedCount && (this.selectedCount !== this.filesCount);
    },
  },

  methods: {
    // Todo: Dev
    fakeFiles() {
      for (let i = 0; i < 100; i += 1) {
        this.addFile({
          name: i,
        });
      }
    },

    // Actions
    close() {
      this.$emit('close');
    },
    setUploadingMode() {
      this.mode = MODES.UPLOADING;
    },
    setBrowsingMode() {
      this.mode = MODES.BROWSING;
    },
    preventNextLayoutClick() {
      this.isBrowserAreaClickPrevented = true;
    },
    resetLayoutClickAbility() {
      this.isBrowserAreaClickPrevented = false;
    },
    extractId(element) {
      if (!element) { return false; }
      return Number(element.getAttribute('data-key'));
    },

    // Events
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
    onDocumentKeyDown(event) {
      const { keyCode } = event;
      // Check for "A" key
      if (event.ctrlKey && keyCode === 65) {
        event.preventDefault();
        this.toggleSelectAll();
        return false;
      }
    },
    onBrowserAreaClick() {
      if (this.isBrowserAreaClickPrevented) {
        this.resetLayoutClickAbility();
        return;
      }
      this.unselectAll();
    },

    // Selection logic
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
      const key = Number(id);
      if (!this.selected.includes(key)) {
        this.selected.push(Number(key));
      }
    },
    toggleSelectAll() {
      if (this.files.length !== this.selectedCount) {
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
    resetPointerEventsOutsideFrame() {
      console.log('allow');
      document.body.classList.remove(bodyLockedClass);
      this.closesViaBackdrop = true;
    },
    preventPointerEventsOutsideFrame() {
      console.log('prevent');
      const { body } = document;
      if (body.classList.contains(bodyLockedClass)) {
        body.classList.add(bodyLockedClass);
      }
      this.closesViaBackdrop = false;
    },
    addDragAndDropEventListeners() {
      window.addEventListener('drop', this.onDrop);
      window.addEventListener('dragover', this.onDragMove);
      window.addEventListener('dragleave', this.onDragMove);
      window.addEventListener('dragend', this.onDragEnd);
      document.addEventListener('keydown', this.onDocumentKeyDown);
    },
    removeDragAndDropEventListeners() {
      window.removeEventListener('drop', this.onDrop);
      window.removeEventListener('dragover', this.onDragMove);
      window.removeEventListener('dragleave', this.onDragMove);
      window.removeEventListener('dragend', this.onDragEnd);
      document.removeEventListener('keydown', this.onDocumentKeyDown);
    },
    onDrop(event) {
      if (!this.dropzoneIncludes(event.target)) {
        event.preventDefault();
      }
      this.resetPointerEventsOutsideFrame();
      this.isDragging = false;
    },
    onDragMove: function (event) {
      if (!this.isDragAndDropEnabled) { return; }

      event.preventDefault();
      this.preventPointerEventsOutsideFrame();

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
    registerSortable() {
      this.sortable = new DragAndDrop(this.$refs.layout, {
        createGhost: this.createGhost,
        on: {
          beforeStart: this.onSortableBeforeStart,
          beforeDragStart: this.onSortableBeforeDragStart,
          dragStart: this.onSortableDragStart,
          dragOver: this.onSortableDragOver,
          dragLeave: this.onSortableDragLeave,
          drop: this.onSortableDrop,
        },
      });
    },
    createGhost(element, fn, { applyStyles, applyImportantGhostStyles }) {
      const { selectedCount } = this;

      if (selectedCount === 1) {
        return fn(element);
      }

      const ghost = document.createElement('div');
      applyImportantGhostStyles(ghost);
      let wrapperSizeSet = false;

      const thumbs = this.$refs.thumbnail
          .filter((thumb) => this.selected.includes(thumb.index))
          .slice(0, 5)
          .map((node) => node.$el);

      thumbs.forEach((thumb, index) => {
        const clone = thumb.cloneNode(true);
        if (!wrapperSizeSet) {
          const rect = thumb.getBoundingClientRect();
          applyStyles(ghost, {
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          });
          wrapperSizeSet = true;
        }
        const modifiers = {
          x: 3,
          y: -1,
        };

        applyStyles(clone, {
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          opacity: 1,
          transform: `translateX(${index * modifiers.x}px) translateY(${index * modifiers.y * -1}px)`,
          zIndex: thumbs.length - index + 1,
        });
        ghost.appendChild(clone);
      });

      const counter = document.createElement('div');
      counter.classList.add('media-library-ghost-counter');
      counter.innerText = selectedCount;
      ghost.appendChild(counter);

      return ghost;
    },
    resetIntersection() {
      this.reorderIntersectionId = null;
    },

    onSortableBeforeStart() {
      return this.canBeSorted;
    },
    onSortableBeforeDragStart(trigger, stop, next) {
      const id = this.extractId(trigger);
      this.addSelection(id);
      this.preventNextLayoutClick();
      this.$nextTick(() => {
        next();
      });
    },
    onSortableDragStart(trigger, stop) {
      if (!this.canBeSorted) {
        return stop();
      }

      this.preventPointerEventsOutsideFrame();

      this.isReordering = true;
    },
    onSortableDragOver(el) {
      const id = this.extractId(el);
      if (this.selected.includes(id)) {
        this.resetIntersection();
      } else {
        this.reorderIntersectionId = id;
      }
    },
    onSortableDragLeave(el) {
      this.resetIntersection();
    },
    onSortableDrop(element) {
      this.isReordering = false;

      this.resetPointerEventsOutsideFrame();

      // Todo: remove
      console.log(element);
    },
    destroySortable() {
      this.sortable.destroy();
    },
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
