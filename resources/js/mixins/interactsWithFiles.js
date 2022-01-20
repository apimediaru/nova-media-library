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
      if (!silent && this.emitEventOnFilesUpdate) {
        this.emitFilesUpdateEvent(value);
      }
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
        file.forEach((item) => this.addFile(item, silent));
      } else {
        this.filesRepository.push(file);
        if (!silent && this.emitEventOnFilesUpdate) {
          this.emitFilesUpdateEvent(this.files);
        }
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
        file.forEach((item) => this.removeFile(item, silent));
      } else {
        this.filesRepository.splice(this.filesRepository.indexOf(file), 1);
        if (!silent && this.emitEventOnFilesUpdate) {
          this.emitFilesUpdateEvent(value);
        }
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
