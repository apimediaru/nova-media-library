<template>
  <media-library-modal
    @modal-close="$emit('modal-close', $event)"
    width="800"
  >
    <h2
      slot="head"
      class="text-lg"
    >{{ __('Help') }}</h2>

    <div
      slot="container"
      class="p-4 overflow-y-auto media-library-scrollbars markdown-body"
      v-html="help"
    />
  </media-library-modal>
</template>

<script>
import MediaLibraryModal from "./MediaLibraryModal";
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

export default {
  name: "HelpModal",

  components: {
    MediaLibraryModal,
  },

  computed: {
    help() {
      return md.render(window.Nova.config.NovaMediaLibrary.help);
    }
  },
};
</script>

<style scoped>

</style>
