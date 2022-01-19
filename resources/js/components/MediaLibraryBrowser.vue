<template>
  <MediaLibraryModal
    @modal-close="close"
    :closes-via-backdrop="onBackdropClick"
    class="media-library-browser media-library-modal--entire-scrollable"
    width="1400"
    :paused="paused"
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
              'media-library-panel-actions-hidden': !filesCount && !hasUploads,
            }"
        >
          <div class="media-library-actions-panel media-library-actions-panel-left media-library-actions">
            <div class="media-library-actions-action media-library-action media-library-action-static">
              <input
                  type="checkbox"
                  class="checkbox cursor-pointer"
                  @change="filesCount !== selectedCount ? selectAll() : unselectAll()"
                  :checked="filesCount === selectedCount"
                  :disabled="!filesCount"
                  :title="__('Select / Reset all')"
              >
            </div>
            <div class="media-library-actions-action media-library-action">
              <select
                  class="w-full form-control form-select cursor-pointer"
                  :disabled="!selectedCount"
                  v-model="action"
              >
                <option value="none" selected>{{ __('Select an action') }}</option>
                <option value="delete">{{ __('Delete') }}</option>
                <option value="makeActive">{{ __('Make active') }}</option>
                <option value="makeInactive">{{ __('Make inactive') }}</option>
                <option value="regenerateThumbnails">{{ __('Regenerate thumbnails') }}</option>
              </select>
            </div>
            <div class="media-library-actions-action media-library-action">
              <button
                  class="btn btn-default btn-primary whitespace-no-wrap cursor-pointer"
                  :disabled="action === 'none'"
                  @click="performBulkAction"
              >{{ __('Apply') }}</button>
            </div>
            <div class="media-library-actions-action media-library-browser-actions-action-search media-library-action">
              <input
                  type="text"
                  class="w-full form-control form-input form-input-bordered"
                  :placeholder="__('Search...')"
              >
            </div>
          </div>
          <div class="media-library-actions-panel media-library-actions-panel-right media-library-actions">
            <div
                class="media-library-browser-actions-action-for-selected"
                v-if="files.length > 0"
            >
              {{ __('Selected:') }} <span class="media-library-browser-actions-action-for-selected-value">{{ selectedCount }} / {{ files.length }}</span>
            </div>
            <button
                class="btn btn-default btn-primary whitespace-no-wrap cursor-pointer media-library-actions-action"
                @click="uploadDetailsVisible = !uploadDetailsVisible"
            >{{ __('Upload details') }}</button>
          </div>
        </div>
      </div>

      <div class="media-library-browser-grid">
        <div
          class="media-library-browser-area"
          @click="onBrowserAreaClick"
          ref="area"
        >
          <div
            class="media-library-layout"
            :class="{
              'media-library-layout--hidden': isDragging,
            }"
            ref="layout"
          >
            <div
              v-if="!hasFiles"
              class="media-library-layout-message"
              :class="{
                'cursor-pointer': canAddFiles,
              }"
              @click="triggerFileUpload"
            >
              {{ __('There are currently no media files in this library.') }}
              <template
                v-if="canAddFiles"
              >
                <br>
                <p class="mt-2">{{ __('Drag and drop, or click to browse and select your files') }}</p>
              </template>
            </div>
<!--            <div-->
<!--                class="media-library-layout-add-file"-->
<!--                v-if="this.hasFiles && canAddFiles && !isReordering"-->
<!--                :title="__('Add file')"-->
<!--                @click="triggerFileUpload"-->
<!--            >+</div>-->
            <MediaThumbnail
              v-if="hasFiles"
              v-for="(file, index) in files"
              :key="index"
              :index="file.order_column"
              :name="file.file_name"
              :image="file.original_url"
              @click="onThumbnailClick(index, $event)"
              @contextmenu="onThumbnailContextmenu(file, $event)"
              :dragged="isReordering && selected.includes(index)"
              :selected="isItemSelected(index)"
              :mine-type="file.mime_type"
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
            <div class="media-library-dropzone-inner">
              <p class="media-library-dropzone-icon">
                <svg class="fill-current w-4 h-4 mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                </svg>
              </p>
              <p class="media-library-dropzone-notice">
                {{ __('Drop your images here') }}
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
        <UploadsList
          v-if="(hasFiles || hasUploads) && uploadDetailsVisible"
          class="media-library-browser-uploads"
          :uploads="uploads"
          @clear="onUploadsClear"
        />
      </div>

    </div>
  </MediaLibraryModal>
</template>

<script>
import MediaLibraryModal from "./MediaLibraryModal";
import MediaThumbnail from "./MediaThumbnail";
import UploadsList from "./UploadsList";
import { DragAndDrop, DragAndDropEvents } from "../utils/DragAndDrop";
import { MediaUploader, MediaUpload } from "../utils/MediaUploader";
import { MultipleMediaRequest } from "../utils/RequestManager";

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
    MediaThumbnail,
    UploadsList,
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

      // Array of selected files IDs
      selected: [],
      selectedIndex: null,

      action: 'none',

      // Prevent next click on layout grid
      isBrowserAreaClickPrevented: false,

      // Prevent next click on modal backdrop
      isBackdropClickPrevented: false,

      // Pause modal events
      paused: false,

      // Uploads
      uploadDetailsVisible: false,
      uploads: [],
    };
  },

  props: {
    field: {
      type: Object,
      default: () => ({}),
      required: true,
    },
    resourceId: {
      type: Number,
      default: null,
      required: true,
    },
    loadedFiles: {
      type: Array,
      default: () => ([]),
    },
  },

  created() {
    // Merge provided via props media files on component creation
    this.files = [...this.field.value || []];

    // Create and attach media uploader to instance
    this.registerUploader();
  },

  mounted() {
    this.addDragAndDropEventListeners();
    this.registerSortable();

  },

  beforeDestroy() {
    this.removeDragAndDropEventListeners();
    this.destroySortable();
    this.destroyUploader();
  },

  computed: {
    isInBrowsingMode() {
      return this.mode === MODES.BROWSING || this.paused;
    },
    isInUploadingMode() {
      return this.mode === MODES.UPLOADING;
    },
    isDropzoneVisible() {
      return !this.paused && this.isDragAndDropEnabled && this.isDragging;
    },
    hasFiles() {
      return this.filesCount > 0;
    },
    hasUploads() {
      return this.uploads.length > 0;
    },
    selectedCount() {
      return this.selected.length;
    },
    filesCount() {
      return this.files.length;
    },
    canBeSorted() {
      return !this.paused && this.selectedCount && (this.selectedCount !== this.filesCount);
    },
    canAddFiles() {
      return true;
    },
  },

  methods: {
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
    preventNextBackdropClick() {
      this.isBackdropClickPrevented = true;
    },
    resetPointerEventsOutsideFrame() {
      document.body.classList.remove(bodyLockedClass);
    },
    preventPointerEventsOutsideFrame() {
      const { body } = document;
      if (body.classList.contains(bodyLockedClass)) {
        body.classList.add(bodyLockedClass);
      }
    },
    onBackdropClick() {
      let resolution = true;
      if (this.isBackdropClickPrevented) {
        resolution = false;
        this.isBackdropClickPrevented = false;
      }
      return resolution;
    },
    triggerFileUpload() {
      this.getUploadInput().click();
    },

    /**
     * Makes request with bulk actions
     *
     * @return {Promise<void>}
     */
    async performBulkAction() {
      // Get processing method key
      const { action } = this;

      // Launch common request for multiple bulk actions
      const request = await new MultipleMediaRequest({
        object: this.field.object,
        objectId: this.resourceId,
        collection: this.field.collection,
        ids: this.extractSelectedIDs(),
        method: action,
      }).run();

      // Ensure that response provides files
      if (request.succeeded() && Array.isArray(request.responseData.data.files)) {
        this.files = request.responseData.data.files;

        // Reset selection if selected method means change of files count
        if (action === 'delete') {
          this.unselectAll();
        }
      }
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
    onThumbnailContextmenu(file, event) {
      console.log('contextmenu');
      event.preventDefault();
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
      this.selected = this.files.map((file, index) => index);
    },
    unselectAll() {
      this.selected = [];
      this.selectedIndex = null;
    },
    extractSelectedIDs() {
      return this.selected.map((i) => this.files[i].id);
    },

    // File input
    registerUploader() {
      this.uploader = new MediaUploader({
        object: this.field.object,
        objectId: this.resourceId,
        collection: this.field.collection,
      }).on('file:upload', this.onFileUpload);
    },
    destroyUploader() {
      this.uploader.off('file:upload', this.onFileUpload);
      this.uploader = null;
    },
    getUploadInput() {
      return this.$refs.upload;
    },
    async onFileInputChange(event) {
      const { target } = event;
      const { files } = target;

      const uploads = [...files].map((item) => new MediaUpload(item));
      this.uploads.push(...uploads);

      this.setUploadingMode();
      this.uploadDetailsVisible = true;

      // Reset input field value to provide an opportunity
      // to upload the same pull of files again
      target.value = null;

      await this.uploader.upload(uploads.reverse());
    },
    addFile(...files) {
      this.files.push(...files);
    },
    onFileUpload(event) {
      const { file } = event;
      if (file) {
        this.addFile(file);
      }
    },
    onUploadsClear() {
      if (this.uploader.isUploading()) {
        return;
      }

      this.uploads = [];
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
      document.addEventListener('keydown', this.onDocumentKeyDown);
    },
    removeDragAndDropEventListeners() {
      window.removeEventListener('drop', this.onDrop);
      window.removeEventListener('dragover', this.onDragMove);
      window.removeEventListener('dragleave', this.onDragMove);
      window.removeEventListener('dragend', this.onDragEnd);
      document.removeEventListener('keydown', this.onDocumentKeyDown);
    },
    dropzoneIncludes(element) {
      return element && element.matches('.media-library-dropzone-input');
    },

    // Drag and drop events
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


    // Sortable
    registerSortable() {
      this.sortable = new DragAndDrop({
        container: this.$refs.layout,
        createGhost: this.createGhost,
        whiteList: ['.media-library-thumbnail'],
        on: {
          [DragAndDropEvents.beforeStart]: this.onSortableBeforeStart,
          [DragAndDropEvents.drag.beforeStart]: this.onSortableBeforeDragStart,
          [DragAndDropEvents.drag.start]: this.onSortableDragStart,
          [DragAndDropEvents.drag.over]: this.onSortableDragOver,
          [DragAndDropEvents.drag.out]: this.onSortableDragOut,
          [DragAndDropEvents.drag.drop]: this.onSortableDrop,
        },
        scrollable: {
          scrollableElements: [this.$refs.layout],
          strict: true,
        },
      });
    },
    destroySortable() {
      this.sortable.destroy();
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
          .filter((thumb) => this.selected.includes(this.extractId(thumb.$el)))
          .slice(0, 5)
          .map((node) => node.$el);

      thumbs.forEach((thumb, index) => {
        const clone = thumb.cloneNode(true);
        clone.classList.add('media-library-thumbnail--ghost');
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

    // Sortable events
    onSortableBeforeStart(event) {
      if (!this.canBeSorted) {
        event.cancel();
      }
    },
    onSortableBeforeDragStart(event) {
      const id = this.extractId(event.source);
      this.addSelection(id);
      this.preventNextLayoutClick();
      this.$nextTick(() => {
        event.proceed();
      });
    },
    onSortableDragStart(event) {
      if (!this.canBeSorted) {
        return event.cancel();
      }

      this.preventPointerEventsOutsideFrame();

      this.isReordering = true;
    },
    onSortableDragOver(event) {
      const id = this.extractId(event.target);
      if (this.selected.includes(id)) {
        this.resetIntersection();
      } else {
        this.reorderIntersectionId = id;
      }
    },
    onSortableDragOut() {
      this.resetIntersection();
    },
    onSortableDrop(event) {
      this.resetPointerEventsOutsideFrame();

      // Prevent modal closing if dropped tarted is backdrop
      const { target } = event.originalEvent;
      if (target && target.classList.contains('media-library-modal-backdrop')) {
        this.preventNextBackdropClick();
      }

      this.isReordering = false;
      // Todo: remove
      console.log('drop:', event.target);
    },
  },

  watch: {
    selected(value) {
      console.log(value);
      if (!value.length) {
        this.selectedIndex = null;
      }
    },
  },
}
</script>

<style scoped>

</style>
