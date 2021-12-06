<template>
  <div class="map__municipalities">
    <inline-svg 
        :src="require('../assets/brazil-municipalities.svg')"
        @loaded="municipalitiesSvgLoaded($event)"
        @error="svgLoadError($event)"
        fill="black"
        aria-label="Brazillian Municipalities Svg Map"
    ></inline-svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InlineSvg from 'vue-inline-svg';

export default defineComponent({
  name: 'BrazilMunicipalitiesView',

  components: {
    InlineSvg
  },

  setup() {
    const svgLoadError = (e: any) => {
      console.log('svgLoadError', e)
    }

    const municipalitiesSvgLoaded = (e: any) => {
      console.log('municipalitiesSvgLoaded', e)
      const municipalitiesList = [...document.querySelectorAll('.map__municipalities path')].map(muni =>muni.getAttribute('inkscape:label'))
      console.log('municipalitiesList ', municipalitiesList);
      // [...document.querySelectorAll('.map__municipalities path')].forEach( (muni : any) => muni.style.setProperty('fill', 'red'))
    }

    return {
      municipalitiesSvgLoaded,
      svgLoadError,
    }
  }
});
</script>