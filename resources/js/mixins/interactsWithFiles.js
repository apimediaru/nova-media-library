export default {
  props: {
    passedFiles: {
      type: Array,
      default: () => ([]),
    },
  },

  data() {
    return {
      /**
       * Files repository
       */
      filesRepository: [],

      /**
       * If true component will emit files change event on files update
       */
      emitEventOnFilesUpdate: true,
    };
  },

  computed: {
    /**
     * Get array of files
     *
     * @return {Object[]}
     */
    files() {
      return this.filesRepository.filter(Boolean);
    },

    /**
     * Get files count
     *
     * @return {Number}
     */
    filesCount() {
      return this.files.length;
    },

    /**
     * True if files exists
     *
     * @return {boolean}
     */
    hasFiles() {
      return this.filesCount > 0;
    },

    /**
     * True if library can add more files
     *
     * @return {boolean}
     */
    canAddFiles() {
      return true;
    },

    /**
     * Get files dictionary in format id => index, attributes
     *
     * @return {Object}
     */
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

    /**
     * Get active files
     *
     * @return {Object[]}
     */
    activeFiles() {
      return this.files.filter((file) => file.active);
    },

    /**
     * Get inactive files
     *
     * @return {Object[]}
     */
    inactiveFiles() {
      return this.files.filter((file) => !file.active);
    },

    /**
     * Get active files count
     *
     * @return {Number}
     */
    activeFilesCount() {
      return this.activeFiles.length;
    },

    /**
     * Get inactive files count
     *
     * @return {Number}
     */
    inactiveFilesCount() {
      return this.inactiveFiles.length;
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
