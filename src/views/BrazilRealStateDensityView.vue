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
import { fetchData as fetchAssets } from '@/services/GetAssetsPerCityService';
import { sleep } from '@/utils/timeHelper';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';
import MapBrowser from '@/components/MapBrowser.vue';
import AssetsPerCity from '@/interfaces/AssetsPerCity';
import { scaleQuantile } from 'd3';

interface CircleAttibutes {
  radius: number
  opacity: number
  cityReference: number
}

export default defineComponent({
  name: 'BrazilRealStateDensityView',

  components: {
    BrazilMunicipalitiesMap,
    MapBrowser,
  },

  setup() {
    const isLoading = ref(false)
    const assets = ref([] as AssetsPerCity[])
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

    const addCircle = (
      gElement: Element, 
      element: Element | null, 
      circleAttibutes: CircleAttibutes
    ) => {
      if(!element) {
        return
      }

      const bbox = (element as SVGPathElement).getBBox()
      const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circleElement.setAttribute('r', circleAttibutes.radius.toString())
      circleElement.setAttribute('fill', 'var(--app-primary-color)')
      circleElement.setAttribute('fill-opacity', circleAttibutes.opacity.toString())
      circleElement.setAttribute('cx', bbox.x.toString())
      circleElement.setAttribute('cy', bbox.y.toString())
      gElement.appendChild(circleElement)
      circleElement.addEventListener('click', () => cityClick(circleAttibutes.cityReference.toString()))
      circleElement.addEventListener('touchend', () => cityClick(circleAttibutes.cityReference.toString()))
    }

    const colorizeMap = () => {
      const gElement = document.querySelector('.brazil-real-state-density__map g')
      if(!gElement) {
        console.warn('SVG not rendered')
        return
      }

      const radiusRange = [1, 2, 4, 8]
      const quantileCount = scaleQuantile()
        .domain(assets.value.map(a => a.assetsCount))
        .range(radiusRange)

      const opacityRange = [0.4, 0.5, 0.6]
      const quantileSquares = scaleQuantile()
        .domain(assets.value.map(a => a.totalSquareMeters))
        .range(opacityRange)

      assets.value.forEach(asset => {
        const pathElement = pathElementsMap.value[asset.cityId.toString()]
        if(!pathElement) {
          return
        }
        addCircle(gElement, pathElement, {
          radius: quantileCount(asset.assetsCount),
          opacity: quantileSquares(asset.totalSquareMeters),
          cityReference: asset.cityId
        })
      })
      Object.entries(pathElementsMap.value).forEach(keyValuePair => {
        const element  = keyValuePair[1]
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
