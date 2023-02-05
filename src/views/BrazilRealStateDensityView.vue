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
        <FundSelector
          :selectedFund="selectedFund"
          :funds="funds"
          @fund-selected="fundSelected"
        >
        </FundSelector>
      </template>

      <template v-slot:browser-details>
      </template>
    </MapBrowser>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { fetchData as fetchAssets } from '@/services/GetAssetsPerCityService';
import { fetchData as fetchFunds } from '@/services/GetFundsService';
import { sleep } from '@/utils/timeHelper';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';
import FundSelector from '@/components/FundSelector.vue';
import MapBrowser from '@/components/MapBrowser.vue';
import AssetsPerCity from '@/interfaces/AssetsPerCity';
import { scaleQuantile } from 'd3';
import Fund from '@/interfaces/Fund';

interface CircleAttibutes {
  radius: number
  opacity: number
  cityReference: number
}

export default defineComponent({
  name: 'BrazilRealStateDensityView',

  components: {
    BrazilMunicipalitiesMap,
    FundSelector,
    MapBrowser,
  },

  setup() {
    const isLoading = ref(false)
    const assets = ref([] as AssetsPerCity[])
    const funds = ref([] as Fund[])
    const pathElementsMap = ref<{ [code: string] : Element | null;}>({})
    const selectedFund = ref('')
    const selectedCityCode = ref('')

    const pathMapLoaded = async (pathMap: { [code: string] : Element | null; }) => {
      isLoading.value = true
      pathElementsMap.value = pathMap
      await sleep(400)
      funds.value = await fetchFunds()
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
      const xCoordinate = bbox.x + (bbox.width / 2)
      const yCoordinate = bbox.y + (bbox.height / 2)
      const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circleElement.setAttribute('r', circleAttibutes.radius.toString())
      circleElement.setAttribute('fill', 'var(--app-primary-color)')
      circleElement.setAttribute('fill-opacity', circleAttibutes.opacity.toString())
      circleElement.setAttribute('cx', xCoordinate.toString())
      circleElement.setAttribute('cy', yCoordinate.toString())
      gElement.appendChild(circleElement)
      circleElement.addEventListener('click', () => cityClick(circleAttibutes.cityReference.toString()))
      circleElement.addEventListener('touchend', () => cityClick(circleAttibutes.cityReference.toString()))
    }

    const addCirclesForEachCity = (gElement: Element) => {
      const radiusRange = [2, 3, 4, 6, 8]
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
    }

    const clearCircles = () => document.querySelectorAll('.brazil-real-state-density__map circle').forEach(e => e.remove())
    
    const colorizeCitiesWithDefaulColor = (defaultColor: string) => {
      Object.entries(pathElementsMap.value).forEach(keyValuePair => {
        const element  = keyValuePair[1]
        element?.setAttribute('fill', defaultColor)
      })
    }

    const colorizeMap = () => {
      const gElement = document.querySelector('.brazil-real-state-density__map g')
      if(!gElement) {
        console.warn('SVG not rendered')
        return
      }

      clearCircles()

      addCirclesForEachCity(gElement)

      colorizeCitiesWithDefaulColor('var(--app-secondary-color)')
    }

    const cityClick = (code: string) => {
      console.log('code', code)
      if(selectedCityCode.value == code) {
        selectedCityCode.value = ''
        return
      }
      selectedCityCode.value = code;
    }

    const fundSelected = async (fundAcronym: string) => {
      selectedFund.value = fundAcronym
      isLoading.value = true
      await sleep(400)
      assets.value = await fetchAssets(selectedFund.value)
      colorizeMap()
      isLoading.value = false
    }

    return {
      assets,
      funds,
      isLoading,
      selectedCityCode,
      selectedFund,
      pathMapLoaded,
      cityClick,
      fundSelected,
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
