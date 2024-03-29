<template>
  <media-library-modal
    @modal-close="close"
    :closes-via-backdrop="false"
    class="media-library-browser media-library-modal--entire-scrollable"
    width="1400"
  >
    <div
        slot="container"
        class="media-library-browser-container"
    >
      <div class="media-library-browser-head">
        <div class="flex align-center">
          <h2 class="media-library-browser-head-title">
            <span>{{ __('Browse media library') }}<template v-if="field.name">: {{ field.name }}</template></span>
          </h2>

          <tooltip
              class="ml-auto mr-4 leading-none"
          >
            <IconQuestionMark
                class="w-5 h-5 fill-primary cursor-pointer"
                @click.native="isHelpActive = true"
            />

            <tooltip-content slot="content">
              {{ __('Help') }}
            </tooltip-content>
          </tooltip>
        </div>

        <div
            class="media-library-panel-actions"
            :class="{
              'media-library-panel-actions-disabled': !selectedCount || isLoading,
              'media-library-panel-actions-hidden': !filesCount,
            }"
        >
          <div class="media-library-actions-panel media-library-actions-panel-left media-library-actions">
            <div
              class="media-library-actions-action media-library-action"
              :class="{
                'media-library-action-static': !isLoading,
              }"
            >
              <!-- Select All -->
              <dropdown
                placement="bottom-end"
                class="-mx-2"
              >
                <dropdown-trigger
                  class="px-2"
                >
                  <fake-checkbox
                    :checked="selectAllChecked"
                  />
                </dropdown-trigger>

                <dropdown-menu
                    slot="menu"
                    direction="ltr"
                    width="250"
                >
                  <div class="p-4">
                    <ul class="list-reset">
                      <li class="flex items-center mb-3">
                        <checkbox-with-label
                          :checked="selectAllChecked"
                          @input="toggleSelectAll"
                        >
                          {{ __('Select all') }} ({{ filesCount }})
                        </checkbox-with-label>
                      </li>
                      <li
                        class="flex items-center mb-3"
                        :class="{
                          'text-60': !activeFilesCount,
                        }"
                      >
                        <checkbox-with-label
                          :checked="selectAllActiveChecked"
                          :disabled="!activeFilesCount"
                          @input="toggleAllActive"
                        >
                          {{ __('Select active') }} ({{ activeFilesCount }})
                        </checkbox-with-label>
                      </li>
                      <li class="flex items-center"
                        :class="{
                          'text-60': !inactiveFilesCount,
                        }"
                      >
                        <checkbox-with-label
                          :checked="selectAllInactiveChecked"
                          :disabled="!inactiveFilesCount"
                          @input="toggleAllInactive"
                        >
                          {{ __('Select inactive') }} ({{ inactiveFilesCount }})
                        </checkbox-with-label>
                      </li>
                    </ul>
                  </div>
                </dropdown-menu>
              </dropdown>
            </div>
            <div class="media-library-actions-action media-library-action">
              <select
                  class="w-full form-control form-select cursor-pointer"
                  :disabled="!selectedCount || !isInteractive"
                  v-model="action"
              >
                <option value="none" selected>{{ __('Select an action') }}</option>
                <option value="delete">{{ __('Delete') }}</option>
                <option value="activate">{{ __('Activate') }}</option>
                <option value="deactivate">{{ __('Deactivate') }}</option>
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
          </div>
          <div class="media-library-actions-panel media-library-actions-panel-right media-library-actions">
            <div
                class="media-library-browser-actions-action-for-selected media-library-actions-action"
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
              class="media-browser-loader"
              v-if="isLoading"
          >
            <loader class="text-60" />
          </div>

          <div
            class="media-library-layout"
            :class="{
              'media-library-layout--hidden': isDragging,
            }"
            v-lazy-load-container
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
            <media-thumbnail
              v-if="hasFiles"
              v-for="(file, index) in files"
              :key="file.id"
              :index="file.order_column"
              :name="file.file_name"
              :image="file.__conversions__.thumbnail"
              :file="file"
              :dragged="isReordering && selected.includes(file.id)"
              :selected="isItemSelected(file.id)"
              :mine-type="file.mime_type"
              ref="thumbnail"
              :highlighted="file.id === selectedIndex"
              :data-key="file.id"
              :active="file.active"
              @click="onThumbnailClick(file, index, $event)"
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
                {{ __('Drop your files here') }}
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

          <context-menu
            ref="menu"
            :reference="getContextMenuReference"
            @before-open="onContextMenuBeforeOpen"
          >
            <context-menu-item
              v-if="selectedCount === 1 && selectedIndex"
              @click="openFileOriginal(selectedIndex)"
              divider="bottom"
            >
              <icon-download class="mr-1" /> {{ __('Open original at new page') }}
            </context-menu-item>
            <context-menu-item
              @click="performBulkAction('activate')"
            >
              <icon-switch-off class="mr-1" /> {{ __('Activate checked') }}
            </context-menu-item>
            <context-menu-item
              @click="performBulkAction('deactivate')"
            >
              <icon-switch-off class="mr-1" /> {{ __('Deactivate checked') }}
            </context-menu-item>
            <context-menu-item
              @click="performBulkAction('delete')"
              divider="top"
            >
              <icon-delete class="mr-1" /> {{ __('Delete checked') }}
            </context-menu-item>
          </context-menu>
        </div>

        <request-list
            v-if="uploadDetailsVisible"
            class="media-library-browser-uploads"
            :requests="requests"
            @clear="onRequestListClear"
        />
      </div>

      <help-modal
        v-if="isHelpActive"
        @modal-close="isHelpActive = false"
      />
    </div>
  </media-library-modal>
</template>

<script>
import MediaLibraryModal from "./MediaLibraryModal";
import MediaThumbnail from "./MediaThumbnail";
import RequestList from "./RequestList";
import ContextMenu from "./ContextMenu/ContextMenu";
import ContextMenuItem from "./ContextMenu/ContextMenuItem";
import { RequestManager, MultipleMediaRequest, SortMediaRequest, UploadMediaRequest } from "../utils/RequestManager";
import { interactsWithFiles } from '../mixins';
import { IconDownload, IconDelete, IconSwitchOff, IconQuestionMark } from "./Icons";
import { LazyLoadContainer } from "../directives";
import { closest } from "../shared/utils/closest";
import { Draggable } from '@shopify/draggable';
import HelpModal from "./HelpModal";

const { throttle, debounce } = window._;

const MODES = Object.freeze({
  BROWSING: 0,
  UPLOADING: 1,
});

const bodyLockedClass = 'media-library-locked';

export default {
  name: "LibraryBrowser",

  mixins: [interactsWithFiles],

  directives: {
    LazyLoadContainer,
  },

  components: {
    HelpModal,
    MediaLibraryModal,
    MediaThumbnail,
    RequestList,
    ContextMenu,
    ContextMenuItem,
    IconDownload,
    IconDelete,
    IconSwitchOff,
    IconQuestionMark,
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
      draggable: null,
      isReordering: false,
      intersectedElement: null,

      // Prevent any upload and reorder interactive actions
      inactive: false,

      // Array of selected files IDs
      selected: [],
      selectedIndex: null,

      action: 'none',

      // Prevent next click on layout grid
      isBrowserAreaClickPrevented: false,

      // Prevent next click on modal backdrop
      isBackdropClickPrevented: false,

      // Requests
      uploadDetailsVisible: false,
      requests: [],

      // Loading
      isLoading: false,

      // Help
      isHelpActive: false,
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
  },

  created() {
    // Merge provided via props media files on component creation
    this.setFiles([...this.passedFiles || []], true);

    // Create and attach media uploader to instance
    this.registerRequestManager();
  },

  mounted() {
    this.addDragAndDropEventListeners();
    this.registerDraggable();
  },

  beforeDestroy() {
    this.removeDragAndDropEventListeners();
    this.destroyDraggable();
    this.destroyRequestManager();
  },

  computed: {
    isInBrowsingMode() {
      return this.mode === MODES.BROWSING;
    },
    isInUploadingMode() {
      return this.mode === MODES.UPLOADING;
    },
    isDropzoneVisible() {
      return this.isDragAndDropEnabled && this.isDragging;
    },
    selectedCount() {
      return this.selected.length;
    },
    canBeSorted() {
      return !this.requestManager.isWorking()
        && this.filesCount > 0
        && this.selectedCount !== this.filesCount;
    },
    isInteractive() {
      return (!this.requestManager.isWorking() && !this.isLoading) || !this.hasFiles;
    },

    /**
     * True if any selection is active
     *
     * @return {Boolean}
     */
    hasSelections() {
      return Boolean(this.filesCount && this.selectedCount);
    },

    /**
     * Determine if all files are checked
     */
    selectAllChecked() {
      return this.filesCount && this.filesCount === this.selectedCount;
    },

    /**
     * Determine if all selected files are active
     *
     * @return {Boolean}
     */
    selectAllActiveChecked() {
      return this.hasSelections
        && this.filesCount
        && this.activeFilesCount > 0
        && this.activeFiles.every((file) => this.selected.includes(file.id));
    },

    /**
     * Determine if all selected files are inactive
     *
     * @return {Boolean}
     */
    selectAllInactiveChecked() {
      return this.hasSelections
        && this.filesCount
        && this.inactiveFilesCount > 0
        && this.inactiveFiles.every((file) => this.selected.includes(file.id));
    },
  },

  methods: {
    /**
     * Emit close event to parent
     */
    close() {
      this.$emit('close', {
        files: this.files,
      });
    },

    /**
     * Todo: write comment
     */
    setUploadingMode() {
      this.mode = MODES.UPLOADING;
    },

    /**
     * Todo: write comment
     */
    setBrowsingMode() {
      this.mode = MODES.BROWSING;
    },

    /**
     * Call this function to prevent selection resetting by clicking layout
     */
    preventNextLayoutClick() {
      this.isBrowserAreaClickPrevented = true;
    },

    /**
     * Reset default behavior of clicking layout area
     */
    resetLayoutClickAbility() {
      this.isBrowserAreaClickPrevented = false;
    },

    /**
     * Extract key from html element data attribute
     *
     * @param {HTMLElement} element
     * @return {boolean|number}
     */
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

    /**
     * Show user default browser file upload interface
     */
    triggerFileUpload() {
      this.getUploadInput().click();
    },

    /**
     * Makes request with bulk actions
     *
     * @param {String|null} specifiedAction
     * @param {Boolean} separately
     * @return {Promise<void>}
     */
    async performBulkAction(specifiedAction = null, separately = false) {
      // Get processing method key
      const action = (typeof specifiedAction === 'string' && specifiedAction !== 'none')
        ? specifiedAction
        : this.action;

      // Set loading state
      this.isLoading = true;

      // Force separate requests on 'regenerateThumbnails' action
      if (action === 'regenerateThumbnails') {
        separately = true;
      }

      // Split into multiple requests if 'separated' flag is truthy
      let sources = [];
      const ids = this.extractSelectedIDs();
      if (separately) {
        sources = ids.map((id) => ([id]));
      } else {
        sources.push(ids);
      }

      let iteration;
      let errors = [];
      while (iteration = sources.pop()) {
        // Launch common request for multiple bulk actions
        const request = await new MultipleMediaRequest({
          object: this.field.object,
          objectId: this.resourceId,
          collection: this.field.collection,
          sources: iteration,
          method: action,
        }).run();

        // Ensure that response provides files
        if (request.succeeded() && Array.isArray(request.responseData.data.files)) {
          this.setFiles(request.responseData.data.files);

          // Reset selection if selected method means change of files count
          if (action === 'delete') {
            this.unselectAll();
          }
        } else {
          const message = request.responseData.message;
          if (message) {
            errors.push(message);
          }
        }
      }

      if (!errors.length) {
        this.$toasted.success(this.__(`Action ":action" was completed successfully`, { action }));
      } else {
        this.$toasted.error(this.__('Action ":action" was completed with errors', { action }));
        errors.forEach((error) => console.error(error));
      }

      // Reset loading state
      this.isLoading = false;
    },


    /**
     * Event that is triggered by clicking thumbnail
     *
     * @param {Object} file
     * @param {Number} index
     * @param {PointerEvent} event
     */
    onThumbnailClick(file, index, event) {
      const { shiftKey, ctrlKey } = event;
      if (shiftKey && ctrlKey && this.selectedIndex) {
        this.selectRange(this.filesDictionary[this.selectedIndex].index, index, true);
      } else if (shiftKey && this.selectedIndex) {
        this.selectRange(this.filesDictionary[this.selectedIndex].index, index);
      } else if (ctrlKey) {
        this.setSelectedIndex(file.id);
        this.toggleSelection(file.id);
      } else {
        this.beginSelection(file.id);
      }
    },

    /**
     * Catch global keydown event
     *
     * @param {KeyboardEvent} event
     * @return {boolean}
     */
    onDocumentKeyDown(event) {
      const { keyCode } = event;
      // Check for "A" key
      if (event.ctrlKey && keyCode === 65) {
        event.preventDefault();
        this.toggleSelectAll();
        return false;
      }
    },

    /**
     * Triggers by clicking specified layout area
     *
     * @param event
     */
    onBrowserAreaClick(event) {
      if (this.isBrowserAreaClickPrevented || closest(event.target, '.context-menu')) {
        this.resetLayoutClickAbility();
        return;
      }
      this.unselectAll();
    },

    /**
     * Start selection with provided id
     *
     * @param {Number} id
     */
    beginSelection(id) {
      this.unselectAll();
      this.addSelection(id);
      this.setSelectedIndex(id);
    },

    /**
     * Store selection anchor
     *
     * @param {Number} id
     */
    setSelectedIndex(id) {
      this.selectedIndex = Number(id);
    },

    /**
     * Select all entries within provided range
     *
     * @param {Number} start
     * @param {Number} end
     * @param {Boolean} keep
     */
    selectRange(start, end, keep = false) {
      const selected = keep ? Array.from(this.selected) : [];
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        selected.push(this.files[i].id);
      }
      this.selected = Array.from(new Set(selected));
    },

    /**
     * Makes entry with provided id selected if possible
     * otherwise removes it from selection
     *
     * @param {Number} id
     */
    toggleSelection(id) {
      if (this.isItemSelected(id)) {
        this.removeSelection(id);
      } else {
        this.addSelection(id);
      }
    },

    /**
     * Returns true if entry with provided id is selected
     *
     * @param {Number} id
     * @return {boolean}
     */
    isItemSelected(id) {
      return this.selected.includes(Number(id));
    },

    /**
     * Remove entry from selection
     *
     * @param {...Number} payload
     */
    removeSelection(...payload) {
      this.setSelection(this.selected.filter((id) => !payload.includes(Number(id))));
    },

    /**
     * Add a new entry to selection
     *
     * @param {...Number} payload
     */
    addSelection(...payload) {
      if (payload.length > 1) {
        const items = new Set([...this.selected, ...payload]);
        this.setSelection(Array.from(items));
      } else {
        const key = Number(payload[0]);
        if (!this.selected.includes(key)) {
          this.selected.push(Number(key));
        }
      }
    },

    /**
     * Select all files if possible otherwise reset selection
     */
    toggleSelectAll() {
      if (this.filesCount !== this.selectedCount) {
        this.selectAll();
      } else {
        this.unselectAll();
      }
    },

    /**
     * Toggle selection of files in provided ids by condition
     *
     * @param {Object[]} files
     * @param {Boolean} condition
     */
    toggleFilesSelectionByCondition(files = [], condition = true) {
      const ids = this.extractFileIds(files);
      if (condition) {
        this.removeSelection(...ids);
      } else {
        this.addSelection(...ids);
      }
    },

    /**
     * Toggle all active files
     */
    toggleAllActive() {
      this.toggleFilesSelectionByCondition(this.activeFiles, this.selectAllActiveChecked);
    },

    /**
     * Toggle all inactive files
     */
    toggleAllInactive() {
      this.toggleFilesSelectionByCondition(this.inactiveFiles, this.selectAllInactiveChecked);
    },

    /**
     * Set selection
     *
     * @param {Number[]} value
     */
    setSelection(value) {
      if (Array.isArray(value)) {
        this.selected = value;
      }
    },

    /**
     * Select all active files
     */
    selectAllActive() {
      this.setSelection(this.activeFiles.map((file) => file.id));
    },

    /**
     * Select all inactive files
     */
    selectAllInactive() {
      this.setSelection(this.inactiveFiles.map((file) => file.id));
    },

    /**
     * Select all available files
     */
    selectAll() {
      this.setSelection(this.files.map((file) => file.id));
    },

    /**
     * Reset all selections
     */
    unselectAll() {
      this.selected = [];
      this.selectedIndex = null;
    },

    /**
     * Get array with id of selected files sorted by column order
     *
     * @return {Number[]}
     */
    extractSelectedIDs() {
      const { filesDictionary } = this;
      return this.selected
          .sort((a, b) => filesDictionary[a].attributes.order_column - filesDictionary[b].attributes.order_column)
          .map((id) => id);
    },

    /**
     * Extract id from files
     *
     * @param {Object[]} files
     * @return {Number[]}
     */
    extractFileIds(files) {
      return files.map((file) => file.id);
    },

    /**
     * Register request manager
     */
    registerRequestManager() {
      this.requestManager = new RequestManager()
        .on('request:completed', this.onRequestManagerComplete);
    },

    /**
     * Destroy request manager
     */
    destroyRequestManager() {
      this.requestManager.destroy();
      this.requestManager = null;
    },

    /**
     * Get file upload input
     *
     * @return {HTMLInputElement}
     */
    getUploadInput() {
      return this.$refs.upload;
    },

    /**
     * Event that occurs on file input change
     *
     * @param {InputEvent} event
     * @return {Promise<void>}
     */
    async onFileInputChange(event) {
      const { target } = event;
      const { files } = target;
      this.setBrowsingMode();

      const uploads = [...files].map((item) => new UploadMediaRequest({
        object: this.field.object,
        objectId: this.resourceId,
        collection: this.field.collection,
        checkDuplicates: this.field.checkDuplicates,
        limit: this.field.limit || 0,
        file: item,
      }));
      this.requests.push(...uploads);

      this.uploadDetailsVisible = true;

      // Reset input field value to provide an opportunity
      // to upload the same pull of files again
      target.value = null;

      await this.requestManager.perform(uploads.reverse());
    },

    /**
     * Request manager request complete callback
     *
     * @param {typeof RequestEvent} event
     */
    onRequestManagerComplete(event) {
      const { request } = event;
      if (request instanceof UploadMediaRequest) {
        this.onFileUpload(request);
      }
    },

    /**
     * Triggers on media file upload
     *
     * @param {UploadMediaRequest} event
     */
    onFileUpload(event) {
      if (event.succeeded()) {
        const {file} = event.responseData.data;
        if (file) {
          this.addFile(file);
        }
      }
    },

    onRequestListClear() {
      if (this.requestManager.isWorking()) {
        return;
      }

      this.requests = [];
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


    /**
     * Register Draggable.js for sorting media files
     */
    registerDraggable() {
      this.draggable = new Draggable(this.$refs.layout, {
        exclude: {
          plugins: [Draggable.Plugins.Focusable],
        },
        draggable: '.media-library-thumbnail',
        delay: 0,
        distance: 5,
        mirror: {
          cursorOffsetX: -10,
          cursorOffsetY: -20,
          constrainDimensions: true,
        },
        scrollable: {
          scrollableElements: [this.$refs.layout],
        },
        classes: {
          'source:dragging': ['media-library-thumbnail--dragged', 'media-library-thumbnail--selected'],
          'draggable:over': 'media-library-thumbnail--intersected',
          'mirror': ['media-library-thumbnail--selected', 'media-library-thumbnail--selected'],
        },
      })
        .on('drag:start', this.onDraggableStart)
        .on('mirror:created', this.onDraggableMirrorCreated)
        .on('drag:over', this.onDraggableOver)
        .on('drag:out', this.onDraggableOut)
        .on('drag:stop', this.onDraggableStop)
        .on('drag:stopped', this.onDraggableStopped);
    },

    /**
     * Handle Draggable drag:start event
     *
     * @param {DragStartEvent} event
     */
    onDraggableStart(event) {
      const { originalSource } = event;
      this.addSelection(this.extractId(originalSource));

      if (!this.canBeSorted) {
        event.cancel();
        return;
      }

      this.isReordering = true;
    },

    /**
     * Handle Draggable mirror:created event
     *
     * @param {MirrorCreatedEvent} event
     */
    onDraggableMirrorCreated(event) {
      const { selectedCount } = this;
      if (selectedCount === 1) {
        return;
      }

      const { mirror } = event;
      const counter = document.createElement('div');
      counter.classList.add('media-library-ghost-counter');
      counter.innerText = selectedCount;
      mirror.appendChild(counter);
    },

    /**
     * Handle Draggable drag:over event
     *
     * @param {DragOverEvent} event
     */
    onDraggableOver(event) {
      this.intersectedElement = event.over;
    },

    /**
     * Handle Draggable drag:out event
     *
     * @param {DragOutEvent} event
     */
    onDraggableOut(event) {
      this.intersectedElement = null;
    },

    /**
     * Handle Draggable drag:stop event
     *
     * @param {DragStopEvent} event
     */
    async onDraggableStop(event) {
      const { intersectedElement } = this;

      // Check for dragged over thumbnail
      if (!intersectedElement) {
        return;
      }

      const targetId = this.extractId(intersectedElement);
      // If element contains empty id for some reason
      // or if element is one of selected stop further
      if (targetId === undefined || this.selected.includes(targetId)) {
        return;
      }

      const sources = this.extractSelectedIDs();
      // Check that sources are OK
      if (!Array.isArray(sources) || !sources.length) {
        return;
      }

      // Work with local copy of files. First filter array of files by selected ids that are
      // sorted by order column. Then insert files with selected ids before target file
      const { filesDictionary } = this;
      const selected = [...this.selected].sort((a, b) => filesDictionary[a].attributes.order_column - filesDictionary[b].attributes.order_column);
      const sequence = this.files.filter((file) => !selected.includes(file.id));
      sequence.splice(sequence.findIndex((file) => file.id === targetId), 0, ...selected.map((id) => filesDictionary[id].attributes));
      this.files = sequence;

      // Create a ['id' => 'value'] array with new sequence of files,
      // also index starts with 1
      let flatTree = {};
      sequence.forEach((file, index) => {
        flatTree[file.id] = index + 1;
      });

      // Reset all selections
      this.unselectAll();

      // Set loading flag
      this.isLoading = true;

      // Make a request and replace local files with files from response
      const request = await new SortMediaRequest({
        sources: flatTree,
        object: this.field.object,
        objectId: this.resourceId,
        collection: this.field.collection,
      }).run();

      if (request.succeeded()) {
        const { files } = request.responseData.data;
        this.setFiles(files);
      } else {
        Nova.$emit('error', this.__('Sorting finished with an error'));
      }

      // Reset loading flag
      this.isLoading = false;
    },

    /**
     * Handle Draggable drag:stopped event
     *
     * @param {DragStoppedEvent} event
     */
    onDraggableStopped(event) {
      this.isReordering = false;
    },

    /**
     * Destroy Draggable instance
     */
    destroyDraggable() {
      const { draggable } = this;
      if (draggable instanceof Draggable) {
        draggable.destroy();
        this.draggable = null;
      }
    },

    /**
     * Before open handler for before open context menu event
     *
     * @param {ContextMenuBeforeOpenEvent} event
     */
    onContextMenuBeforeOpen(event) {
      if (this.requestManager.isWorking()) {
        event.cancel();
        return;
      }

      const { target } = event.originalEvent;
      const thumbnail = closest(target, '.media-library-thumbnail');
      if (!thumbnail) {
        event.cancel();
        return;
      }

      const id = this.extractId(thumbnail);
      if (id === undefined) {
        return;
      }

      if (this.selectedCount === 0 || this.selectedCount === 1) {
        this.beginSelection(id);
      }
    },

    /**
     * Get context menu reference
     *
     * @return {HTMLDivElement}
     */
    getContextMenuReference() {
      return this.$refs.layout;
    },

    /**
     * Open file original image at new window
     *
     * @param {Number} id
     */
    openFileOriginal(id) {
      if (!id) {
        return;
      }

      const file = this.filesDictionary[id];
      if (!file || !file.attributes.original_url) {
        return;
      }

      window.open(file.attributes.original_url, '_blank');
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
