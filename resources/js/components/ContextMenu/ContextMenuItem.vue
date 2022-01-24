<template>
  <li
    class="context-menu-item"
    :class="[
      divider ? `context-menu-item--divider-${divider}` : false,
    ]"
  >
    <div class="context-menu-item-inner"
      @click="onClick"
    >
      <slot />
    </div>
  </li>
</template>

<script>
export default {
  name: "ContextMenuItem",

  props: {
    divider: {
      type: String,
      default: null,
    },
  },

  methods: {
    onClick(event) {
      this.$emit('click', event);
      this.$parent.hide();
    },
  },
}
</script>

<style scoped>

</style>
