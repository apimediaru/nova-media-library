<template>
  <panel-item :field="field">
    <div slot="value">
      <MediaBoard
          v-if="field.value.length"
          :value="field.value"
      />
      <div v-else>&mdash;</div>
    </div>
  </panel-item>
</template>

<script>
import MediaBoard from "../MediaBoard";
export default {
  props: ['resource', 'resourceName', 'resourceId', 'field'],

  components: {
    MediaBoard,
  },
};
</script>
