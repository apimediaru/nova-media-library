<template>
  <default-field
    :field="field"
    :errors="errors"
    :show-help-text="showHelpText"
    full-width-content
  >
    <template slot="field">
      <portal to="modals" transition="fade-transition">
        <MediaLibraryBrowser
          v-if="isBrowsingModalOpen"
          @close="onBrowsingModalClose"
          :resourceId="resourceId"
          :field="field"
          :passed-files="value"
        />

        <ConfirmActionModal
          v-if="isClearConfirmActionModalShown"
          @close="closeConfirmModal"
          @confirm="clearCollection"
        >
          <template v-slot:heading>{{ __('Are you sure you want to clear this collection?') }}</template>

          <template v-slot:content>
            <p class="text-80 leading-normal">{{ __('All files will be removed') }}</p>
          </template>
        </ConfirmActionModal>
      </portal>

      <MediaBoard
        v-if="value.length"
        :value="value"
        :loading="loading"
      />
      <div v-else>
        {{ __('Media library is empty') }}
      </div>

      <div class="field-buttons ml-auto mt-8">
        <button
          type="button"
          class="btn btn-default btn-danger inline-flex items-center relative ml-auto mr-3"
          @click="showConfirmModal"
          v-if="value.length"
        >
          <span>
            {{ __('Clear') }}
          </span>
        </button>
        <button
          type="button"
          class="btn btn-default btn-primary inline-flex items-center relative ml-auto mr-3"
          @click="openMediaBrowser"
        >
          <span>
            {{ __('Media library') }}
          </span>
        </button>
      </div>
    </template>
  </default-field>
</template>

<script>
import { FormField, HandlesValidationErrors } from 'laravel-nova';
import MediaLibraryBrowser from "../MediaLibraryBrowser";
import ConfirmActionModal from "../ConfirmActionModal";
import MediaBoard from "../MediaBoard";
import { ClearMediaRequest } from "../../utils/RequestManager/Requests";

export default {
  mixins: [FormField, HandlesValidationErrors],

  components: {
    MediaLibraryBrowser,
    MediaBoard,
    ConfirmActionModal,
  },

  props: ['resourceName', 'resourceId', 'field'],

  data() {
    return {
      isBrowsingModalOpen: false,
      isLoading: false,
      isClearConfirmActionModalShown: false,
    };
  },

  methods: {
    /*
     * Set the initial, internal value for the field.
     */
    setInitialValue() {
      this.value = this.field.value || ''
    },

    /**
     * Fill the given FormData object with the field's internal value.
     */
    fill(formData) {
      // Just do nothing, don't modify that value
    },

    /**
     * Show media browser
     */
    openMediaBrowser() {
      this.isBrowsingModalOpen = true;
    },

    /**
     * Event which is triggered by browsing modal close
     *
     * @param event
     */
    onBrowsingModalClose(event) {
      this.isBrowsingModalOpen = false;
      this.value = event.files;
    },

    /**
     * Show clear action confirmation modal
     */
    showConfirmModal() {
      this.isClearConfirmActionModalShown = true;
    },

    /**
     * Hide clear action confirmation modal
     */
    closeConfirmModal() {
      this.isClearConfirmActionModalShown = false;
    },

    /**
     * Completely clear linked to current field media collection
     */
    async clearCollection() {
      this.closeConfirmModal();

      const { field } = this;
      if (!field.collection) {
        return;
      }

      this.isLoading = true;

      const request = await new ClearMediaRequest({
        object: field.object,
        objectId: this.resourceId,
        collection: field.collection,
      }).run();

      if (request.succeeded()) {
        const response = request.responseData;
        const { files } = response.data;
        this.value = files;
      }

      this.isLoading = false;
    },
  },
}
</script>
