<template>
  <div class="brazil-states-map">
    <inline-svg 
      :src="require('../assets/brazil-states.svg')"
      @loaded="$emit('loaded')"
      @error="svgLoadError($event)"
      width="500" 
      fill="black"
      aria-label="Inline Svg Map"
    ></inline-svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InlineSvg from 'vue-inline-svg';

export default defineComponent({
  name: 'BrazilStatesMap',

  components: {
    InlineSvg,
  },

  setup() {
    const svgLoadError = (e: any) => {
      console.warn('svgLoadError', e)
    }

    return {
      svgLoadError,
    }
  },
});
</script>