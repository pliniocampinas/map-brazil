<template>
  <div class="geo-features">
    <div class="geo-features__container">
      <BrazilMunicipalitiesMap
        class="geo-features__map"
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
import { fetchData } from '@/services/GetCityGeographicFeaturesService';
import CityGeographicFeatures from '@/interfaces/CityGeographicFeatures';

export default defineComponent({
  name: 'CityGeographicFeaturesView',

  components: {
    BrazilMunicipalitiesMap,
  },

  setup() {
    const selectedCity = ref('')
    const isLoading = ref(false)
    const municipalitiesList = ref<CityGeographicFeatures[]>([])

    const loadData = async () => {
      isLoading.value = true
      try {
        const data = await fetchData()
        municipalitiesList.value = data
        isLoading.value = false
      } catch(err) {
        isLoading.value = false
      }
    }

    const getFeatureColor = (city: CityGeographicFeatures): string => {
      // TODO: Handle intersections with matopiba legal amazon and semiarid
      if(city.isMatopiba) {
        return 'rgb(180, 180, 180)'
      }

      if(city.isSeaFront) {
        return 'rgb(50, 50, 180)'
      }

      if(city.isSemiArid) {
        return 'rgb(252, 172, 99)'
      }

      if(city.isLegalAmazon) {
        return 'rgb(50, 172, 50)'
      }

      return 'rgb(0, 122, 97)';
    }
    
    const colorizePaths = (pathElementsMap: { [code: string] : Element | null; }) => {
      municipalitiesList.value.forEach(d => {
        const pathElement = pathElementsMap[d.cityId]
        if(pathElement) {
          pathElement.setAttribute("fill", getFeatureColor(d))
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
.geo-features {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 750px;
  margin: auto;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: relative;
}

.geo-features__container {
  background-color: #f9f9f9;
}

.geo-features__map {
  height: 500px;
}
</style>