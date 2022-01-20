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
          :passed-files="field.value"
        />
      </portal>

      <MediaBoard
        :value="this.value"
      />

      <div class="field-buttons ml-auto mt-8">
        <button
            type="button"
            class="btn btn-default btn-danger inline-flex items-center relative ml-auto mr-3"
        >
            <span>
              {{ __('Clear') }}
            </span>
        </button>
        <button
            type="button"
            @click="openMediaBrowser"
            class="btn btn-default btn-primary inline-flex items-center relative ml-auto mr-3"
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
  },
}
</script>
