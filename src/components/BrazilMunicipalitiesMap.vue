<template>
  <div class="municipalities-map">
    <inline-svg 
      :src="require('../assets/municipalities-map.svg')"
      @loaded="svgLoaded"
      @error="svgLoadError($event)"
      fill="black"
      aria-label="Brazil Municipalities Map"
    ></inline-svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InlineSvg from 'vue-inline-svg';
import svgPanZoom from 'svg-pan-zoom'

export default defineComponent({
  name: 'BrazilMunicipalitiesMap',

  components: {
    InlineSvg,
  },

  setup(_, { emit }) {
    const svgLoadError = (e: Error) => {
      console.warn('svgLoadError', e)
    }

    const svgLoaded = () => {
      svgPanZoom('.municipalities-map svg')
      emit('loaded')
    }

    return {
      svgLoadError,
      svgLoaded,
    }
  },
});
</script>

<style>
.map__municipality {
  stroke: #232323;
  stroke-width: 0;
  cursor: pointer;
}

.map__municipality:hover,
.map__municipality--selected {
  opacity: 0.7;
  stroke-width: 3;
  stroke: #cccccc;
}

.municipalities-map svg {
  width: 100%;
  height: 100%;
}
</style>