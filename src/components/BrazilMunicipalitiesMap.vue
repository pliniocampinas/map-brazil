<template>
  <div class="municipalities-map" ref="chartContainerElement">
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
import { defineComponent, ref, watch } from 'vue';
import InlineSvg from 'vue-inline-svg';
import svgPanZoom from 'svg-pan-zoom'

export default defineComponent({
  name: 'BrazilMunicipalitiesMap',

  components: {
    InlineSvg,
  },

  props: {
    selectedCityCode: {
      type: String,
      default: null
    },
  },

  setup(props, { emit }) {
    const chartContainerElement = ref(null as HTMLElement | null)
    const pathElementsMap: { [code: string] : Element | null; } = {}
    const svgLoadError = (e: Error) => {
      console.warn('svgLoadError', e)
    }

    const svgLoaded = () => {
      svgPanZoom('.municipalities-map svg')
      emit('loaded')

      if(!chartContainerElement.value) {
        return
      }

      for (const pathElement of chartContainerElement.value.querySelectorAll('path')) {
        const code = pathElement.getAttribute('citycode')
        if(!code) {
          continue
        }
        pathElement.addEventListener('click', () => emit('city-click', code))
        pathElement.addEventListener('touchend', () => emit('city-click', code))
        pathElementsMap[code] = pathElement
      }
      emit('path-map-loaded', pathElementsMap)
    }

    const getPathElement = (code: string) => {
      return chartContainerElement.value?.querySelector(`path[citycode="${code}"]`)
    }

    watch(
      () => props.selectedCityCode,
      (code, prevCode) => {
        if(prevCode) {
          const previouslySelectedPathElement = getPathElement(prevCode)
          previouslySelectedPathElement?.classList.remove('map__municipality--selected')
        }
        const selectedPathElement = getPathElement(code)
        selectedPathElement?.classList.add('map__municipality--selected')
      }
    )

    return {
      chartContainerElement,
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