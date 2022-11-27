<template>
  <div class="semi-arid">
    <div class="semi-arid__container">
      <BrazilMunicipalitiesMap
        class="semi-arid__map"
        :selectedCityCode="selectedCity"
        @loaded="svgLoaded"
        @city-click="cityClick"
        @path-map-loaded="pathMapLoaded"
      >
      </BrazilMunicipalitiesMap>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';
import { fetchData } from '@/services/GetCityGdpService';
import MunicipalitiesData from '@/interfaces/MunicipalitiesData';

export default defineComponent({
  name: 'SemiAridView',

  components: {
    BrazilMunicipalitiesMap,
  },

  setup() {
    const selectedCity = ref('')
    const isLoading = ref(false)
    const municipalitiesList = ref<MunicipalitiesData[]>([])

    const loadData = async () => {
      isLoading.value = true
      try {
        const data = await fetchData(2019)
        municipalitiesList.value = data
        isLoading.value = false
      } catch(err) {
        isLoading.value = false
      }
    }
    
    const colorizePaths = (pathElementsMap: { [code: string] : Element | null; }) => {
      municipalitiesList.value.forEach(d => {
        const pathElement = pathElementsMap[d.code]
        if(pathElement) {
          pathElement.setAttribute("fill", 
            d.gdpPerCapitaBrl > 10000? 'rgb(0, 122, 97)': 'rgb(252, 172, 99)')
        }
      })
    }

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
      pathMapLoaded: (pathMap: { [code: string] : Element | null; }) => {
        loadData().then(() => colorizePaths(pathMap))
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