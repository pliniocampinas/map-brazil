<template>
  <div class="brazil-real-state-density">    
    <MapBrowser :isLoading="isLoading">
      <template v-slot:map-svg>
        <div class="brazil-real-state-density__map-container">
          <BrazilMunicipalitiesMap
            class="brazil-real-state-density__map"
            :selectedCityCode="selectedCityCode"
            @city-click="cityClick"
            @path-map-loaded="pathMapLoaded"
          >
          </BrazilMunicipalitiesMap>
        </div>
      </template>

      <template v-slot:browser-options>
        
      </template>

      <template v-slot:browser-details>
      </template>
    </MapBrowser>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { fetchData as fetchAssets } from '@/services/GetAssetsService';
import { sleep } from '@/utils/timeHelper';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';
import MapBrowser from '@/components/MapBrowser.vue';
import Asset from '@/interfaces/Asset';
import { Path } from 'd3-path';


export default defineComponent({
  name: 'BrazilRealStateDensityView',

  components: {
    BrazilMunicipalitiesMap,
    MapBrowser,
  },

  setup() {
    const isLoading = ref(false)
    const assets = ref([] as Asset[])
    const pathElementsMap = ref<{ [code: string] : Element | null;}>({})
    const selectedCityCode = ref('')

    const pathMapLoaded = async (pathMap: { [code: string] : Element | null; }) => {
      isLoading.value = true
      pathElementsMap.value = pathMap
      await sleep(400)
      assets.value = await fetchAssets()
      colorizeMap()
      isLoading.value = false
    }

    const addCircle = (gElement: Element, element: Element | null) => {
      if(!element) {
        return
      }

      const bbox = (element as SVGPathElement).getBBox()
      const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circleElement.setAttribute('r', '6')
      circleElement.setAttribute('fill', 'var(--app-primary-color)')
      circleElement.setAttribute('fill-opacity', '0.4')
      circleElement.setAttribute('cx', bbox.x.toString())
      circleElement.setAttribute('cy', bbox.y.toString())
      gElement.appendChild(circleElement)
    }

    const normalizeCityName = (name: string) => name.normalize('NFD').replace(/\p{Diacritic}/gu, "")

    const colorizeMap = () => {
      const gElement = document.querySelector('.brazil-real-state-density__map g')
      if(!gElement) {
        console.warn('SVG not rendered')
        return
      }
      Object.entries(pathElementsMap.value).forEach(keyValuePair => {
        const element  = keyValuePair[1]
        const cityName = normalizeCityName(element?.getAttribute('description')?? '')
        if(assets.value.find(asset => normalizeCityName(asset.city) === cityName)) {
          addCircle(gElement, element)
        }

        element?.setAttribute('fill', 'var(--app-secondary-color)')
      })
    }

    const cityClick = (code: string) => {
      console.log('code', code)
      if(selectedCityCode.value == code) {
        selectedCityCode.value = ''
        return
      }
      selectedCityCode.value = code;
    }

    return {
      assets,
      isLoading,
      selectedCityCode,
      pathMapLoaded,
      cityClick,
    }
  }
});
</script>

<style scoped>
.brazil-real-state-density__map-container {
  position: relative;
}

.brazil-real-state-density__map {
  height: 500px;
}

</style>
