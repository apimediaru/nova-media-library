<template>
  <default-field :field="field" :errors="errors" :show-help-text="showHelpText">
    <template slot="field">
      <portal to="modals" transition="fade-transition">
        <MediaLibraryBrowser
          v-if="isBrowsingModalOpen"
          @close="onBrowsingModalClose"
          :resourceId="resourceId"
          :field="field"
        />
      </portal>


      <div class="field-buttons ml-auto">
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
import MediaLibraryBrowser from "./MediaLibraryBrowser";

export default {
  mixins: [FormField, HandlesValidationErrors],

  components: {
    MediaLibraryBrowser,
  },

  props: ['resourceName', 'resourceId', 'field'],

  data() {
    return {
      isBrowsingModalOpen: false,
    }
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
      // formData.append(this.field.attribute, this.value || '')
    },

    // actual
    openMediaBrowser() {
      this.isBrowsingModalOpen = true;
    },
    onBrowsingModalClose() {
      this.isBrowsingModalOpen = false;
    },
  },
}
</script>
