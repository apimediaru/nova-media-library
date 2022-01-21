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
      </portal>

      <MediaBoard
        v-if="value.length"
        :value="value"
        :loading="loading"
      />
      <div
        v-else
      >
        {{ __('Media library is empty') }}
      </div>

      <div class="field-buttons ml-auto mt-8">
        <button
            type="button"
            class="btn btn-default btn-danger inline-flex items-center relative ml-auto mr-3"
            @click="clearCollection"
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
import MediaBoard from "../MediaBoard";
import { ClearMediaRequest } from "../../utils/RequestManager/Requests";

export default {
  mixins: [FormField, HandlesValidationErrors],

  components: {
    MediaLibraryBrowser,
    MediaBoard,
  },

  props: ['resourceName', 'resourceId', 'field'],

  data() {
    return {
      isBrowsingModalOpen: false,
      isLoading: false,
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
      // Just do nothing
    },

    // actual
    openMediaBrowser() {
      this.isBrowsingModalOpen = true;
    },

    onBrowsingModalClose(event) {
      this.isBrowsingModalOpen = false;
      this.value = event.files;
    },

    async clearCollection() {
      const { field } = this;
      if (!field.collection) {
        return;
      }

      this.isLoading = true;

      // Todo: perform user check
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
