<template>
  <div class="arrow-button">
    <svg class="arrow-button__icon" :direction="direction" alt="Arrow Icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/></svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";

enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

export default defineComponent({
  name: 'ArrowButton',

  props: {
    direction: {
      type: String as PropType<Direction>,
      default: "up"
    }
  },

  setup(props) {

    const directionClass = computed(() => {
      return `arrow-button__icon--${props.direction}`
    })

    return {
      directionClass
    }
  }
});
</script>

<style scoped>
.arrow-button {
  height: 40px;
  width: 40px;
  display: inline-block;
}

.arrow-button__icon {
  height: 40px;
  width: 40px;
}

.arrow-button__icon[direction="right"] {
  transform: rotate(90deg);
}

.arrow-button__icon[direction="down"] {
  transform: rotate(180deg);
}

.arrow-button__icon[direction="left"] {
  transform: rotate(270deg);
}
</style>