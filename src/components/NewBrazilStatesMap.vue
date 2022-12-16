<template>
  <div class="brazil-states-map" ref="mapContainerElement">
    <inline-svg 
      :src="require('../assets/brazil-states.svg')"
      @loaded="svgLoaded"
      @error="svgLoadError($event)"
      fill="black"
      aria-label="Brazil States Map"
    ></inline-svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import InlineSvg from 'vue-inline-svg';

export default defineComponent({
  name: 'NewBrazilStatesMap',

  components: {
    InlineSvg,
  },

  props: {
    selectedState: {
      type: String,
      default: null
    },
  },

setup(props, { emit }) {
    const mapContainerElement = ref(null as HTMLElement | null)
    const pathElementsMap: { [code: string] : Element | null; } = {}
    const svgLoadError = (e: Error) => {
      console.warn('svgLoadError', e)
    }

    const svgLoaded = () => {
      svgPanZoom('.brazil-states-map svg')
      emit('loaded')

      if(!mapContainerElement.value) {
        return
      }

      for (const linkElement of mapContainerElement.value.querySelectorAll('a')) {
        const pathElement = linkElement.querySelector('path:not(.circle)')
        const code = pathElement?.getAttribute('statecode')
        if(!code) {
          continue
        }
        linkElement.addEventListener('click', () => emit('city-click', code))
        linkElement.addEventListener('touchend', () => emit('city-click', code))
        pathElementsMap[code] = pathElement
      }
      emit('path-map-loaded', pathElementsMap)
    }

    const getPathElement = (code: string) => {
      return mapContainerElement.value?.querySelector(`path[citycode="${code}"]`)
    }

    watch(
      () => props.selectedState,
      (code, prevCode) => {
        if(prevCode) {
          const previouslySelectedPathElement = getPathElement(prevCode)
          previouslySelectedPathElement?.classList.remove('map__state--selected')
        }
        const selectedPathElement = getPathElement(code)
        selectedPathElement?.classList.add('map__state--selected')
      }
    )

    return {
      mapContainerElement,
      svgLoadError,
      svgLoaded,
    }
  }
});
</script>

<style>
a.estado:hover,
.map__state--selected {
  filter: brightness(1.2);
  /* opacity: 0.7; */
  cursor: pointer;
}

a.estado:hover text {
  filter: invert(1);
}

a.estado:hover path.circle {
  filter: invert(1);
}

.brazil-states-map svg {
  width: 100%;
  height: 100%;
}
</style>