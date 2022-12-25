<template>
  <div 
    class="brazil-states-map" 
    ref="mapContainerElement" 
    :class="{
      'brazil-states-map--no-circles': hideCircles,
      'brazil-states-map--no-labels': hideLabels,
    }"
  >
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
import svgPanZoom from 'svg-pan-zoom'

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
    hideCircles: {
      type: Boolean,
      default: false
    },
    hideLabels: {
      type: Boolean,
      default: false
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
        linkElement.addEventListener('click', () => emit('state-click', code))
        linkElement.addEventListener('touchend', () => emit('state-click', code))
        pathElementsMap[code] = pathElement
      }
      emit('path-map-loaded', pathElementsMap)
    }

    const getPathElement = (code: string) => {
      return mapContainerElement.value?.querySelector(`path[statecode="${code}"]`)
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
.brazil-states-map--no-circles .circle,
.brazil-states-map--no-labels text {
  display: none;
}

a.estado:hover,
.map__state--selected {
  filter: brightness(1.5);
  cursor: pointer;
}

.map__state--selected + text,
a.estado:hover text,
a.estado path[dark-mode] + text {
  filter: invert(1);
}

a.estado:hover path[dark-mode],
.map__state--selected[dark-mode] {
  filter: brightness(0.5);
}

a.estado:hover path.circle,
.map__state--selected + .circle {
  filter: brightness(1.5);
}

.brazil-states-map svg {
  width: 100%;
  height: 100%;
}
</style>