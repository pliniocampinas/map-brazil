<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
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
    <div class="map__municipalities">
      <inline-svg 
          :src="require('../assets/brazil-municipalities.svg')"
          @loaded="municipalitiesSvgLoaded($event)"
          @error="svgLoadError($event)"
          fill="black"
          aria-label="Brazillian Municipalities Svg Map"
      ></inline-svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
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

    const municipalitiesSvgLoaded = (e: any) => {
      console.log('municipalitiesSvgLoaded', e)
      const municipalitiesList = [...document.querySelectorAll('.map__municipalities path')].map(muni =>muni.getAttribute('inkscape:label'))
      console.log('municipalitiesList ', municipalitiesList);
    }

    onMounted(() => {
      const stateList = [...document.querySelectorAll('.estado')].map(estado => estado.getAttribute('xlink:href'))
      console.log('onMounted', stateList);
    })

    return {
      statesSvgLoaded,
      municipalitiesSvgLoaded,
      svgLoadError,
    }
  }
});
</script>
