export default {
  props: {
    passedFiles: {
      type: Array,
      default: () => ([]),
    },
  },

  data() {
    return {
      // Files repository
      filesRepository: [],

      // If set to true emit event on files update
      emitEventOnFilesUpdate: true,
    };
  },

  computed: {
    files() {
      return this.filesRepository.filter(Boolean);
    },
    filesCount() {
      return this.files.length;
    },
    hasFiles() {
      return this.filesCount > 0;
    },
    canAddFiles() {
      return true;
    },
    filesDictionary() {
      const dictionary = {};
      this.files.forEach((file, index) => {
        dictionary[file.id] = {
          index,
          attributes: file,
        };
      });
      return dictionary;
    },
  },

  methods: {
    /**
     * Set instance files
     *
     * @param {Array} value
     * @param {Boolean} silent prevents emitting an update event
     */
    setFiles(value, silent = false) {
      this.filesRepository = value;
      this.resolveFilesUpdateEvent(silent);
    },

    /**
     * Remove all files
     *
     * @param {Boolean} silent prevents emitting an update event
     */
    clearFiles(silent = false) {
      this.setFiles([], silent);
    },

    /**
     * Add file of array of files
     *
     * @param {Object|Object[]} file
     * @param {Boolean} silent prevents emitting an update event
     */
    addFile(file, silent = false) {
      if (Array.isArray(file)) {
        file.forEach((item) => this.addFile(item, true));
        this.resolveFilesUpdateEvent(silent);
      } else {
        this.filesRepository.push(file);
        this.resolveFilesUpdateEvent(silent);
      }
    },

    /**
     * Remove file or array of files
     *
     * @param {Object|Object[]} file
     * @param {Boolean} silent prevents emitting an update event
     */
    removeFile(file, silent = false) {
      if (Array.isArray(file)) {
        file.forEach((item) => this.removeFile(item, true));
        this.resolveFilesUpdateEvent(silent);
      } else {
        const index = this.filesRepository.indexOf(file);
        if (index === -1) {
          return;
        }
        this.filesRepository.splice(index, 1);
        this.resolveFilesUpdateEvent(silent);
      }
    },

    /**
     * Helper function for event emitting
     *
     * @param {Boolean} silent
     */
    resolveFilesUpdateEvent(silent = false) {
      if (!silent && this.emitEventOnFilesUpdate) {
        this.emitFilesUpdateEvent(this.files);
      }
    },

    /**
     * Emit files update event to parent instance
     *
     * @param {Object[]} value
     */
    emitFilesUpdateEvent(value) {
      this.$emit('files-update', value);
    },
  },
}
