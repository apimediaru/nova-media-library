<template>
  <span>
    <span
      v-if="field.value && field.value.length"
    >
      <a
          @click="openViewModal"
          class="cursor-pointer dim inline-block text-primary font-bold text-sm transition-all"
          aria-role="button"
      >{{ __('Show gallery') }}</a>
    </span>
    <span
      v-else
    >&mdash;</span>

    <portal to="modals" transition="fade-transition">
      <MediaViewerModal
        v-if="isModalOpen"
        :value="field.value"
        @modal-close="closeViewModal"
      />
    </portal>
  </span>
</template>

<script>
import MediaViewerModal from "../MediaViewerModal";

export default {
  data: () => ({
    isModalOpen: false,
  }),

  props: ['resourceName', 'field'],

  components: {
    MediaViewerModal,
  },

  methods: {
    openViewModal() {
      this.isModalOpen = true;
    },
    closeViewModal() {
      this.isModalOpen = false;
    },
  },
};
</script>
