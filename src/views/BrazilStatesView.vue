<template>
  <div class="map__states">
    <inline-svg 
        :src="require('../assets/brazil-states.svg')"
        @loaded="statesSvgLoaded($event)"
        @error="svgLoadError($event)"
        width="500" 
        fill="black"
        aria-label="Brazillian States Svg Map"
    ></inline-svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InlineSvg from 'vue-inline-svg';

export default defineComponent({
  name: 'HomeView',

  components: {
    InlineSvg
  },

  setup() {
    const statesSvgLoaded = (e: any) => {
      console.log('statesSvgLoaded', e)
      const stateList = [...document.querySelectorAll('.estado')].map(estado => estado.getAttribute('xlink:href'))
      console.log('stateList ', stateList);
    }
    const svgLoadError = (e: any) => {
      console.log('svgLoadError', e)
    }

    return {
      statesSvgLoaded,
      svgLoadError,
    }
  }
});
</script>

