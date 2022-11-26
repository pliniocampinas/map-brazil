<template>
  <div class="semi-arid">
    <div class="semi-arid__container">
      <BrazilMunicipalitiesMap
        class="semi-arid__map"
        :selectedCityCode="selectedCity"
        @loaded="svgLoaded"
        @city-click="cityClick"
      >
      </BrazilMunicipalitiesMap>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';

export default defineComponent({
  name: 'SemiAridView',

  components: {
    BrazilMunicipalitiesMap,
  },

  setup() {
    const selectedCity = ref('')

    return {
      selectedCity,
      svgLoaded: () => console.log('svgLoaded'),
      svgLoadError: () => console.log('svgLoadError'),
      cityClick: (code: string) => {
        if(selectedCity.value == code) {
          selectedCity.value = ''
          return
        }
        selectedCity.value = code;
      },
    }
  }
});
</script>

<style>
.semi-arid {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 750px;
  margin: auto;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: relative;
}

.semi-arid__container {
  background-color: #f9f9f9;
}

.semi-arid__map {
  height: 500px;
}
</style>