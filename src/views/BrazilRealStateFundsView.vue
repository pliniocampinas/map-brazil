<template>
  <div class="brazil-real-state-funds">    
    <MapBrowser :isLoading="isLoading">
      <template v-slot:map-svg>
        <div class="brazil-real-state-funds__map-container">
          <BrazilStatesMap
            class="brazil-real-state-funds__map"
            hideCircles
            hideLabels
            :selectedState="selectedStateCode"
            @state-click="stateClick"
            @path-map-loaded="statesSvgLoaded"
          >
          </BrazilStatesMap>
          <FundViewSwitcher @select-view="viewSelected" :selectedView="selectedView"/>
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
        <FundStateDetails :state="selectedStateDetails"/>
      </template>
    </MapBrowser>
    <AssetBrowser :assets="assets">
    </AssetBrowser>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { fetchData as fetchFunds } from '@/services/GetFundsService';
import { fetchData as fetchAssets } from '@/services/GetAssetsService';
import { fetchData as fetchAssetsPerStateService } from '@/services/GetAssetsPerStateService';
import { sleep } from '@/utils/timeHelper';
import AssetBrowser from '@/components/AssetBrowser.vue';
import FundSelector from '@/components/FundSelector.vue';
import FundStateDetails from '@/components/FundStateDetails.vue';
import FundViewSwitcher from '@/components/FundViewSwitcher.vue';
import BrazilStatesMap from '@/components/BrazilStatesMap.vue';
import MapBrowser from '@/components/MapBrowser.vue';
import Fund from '@/interfaces/Fund';
import AssetsPerState from '@/interfaces/AssetsPerState';
import { interpolateYlGn, scaleQuantile } from 'd3';
import Asset from '@/interfaces/Asset';

const getColorFunction = (dataset: number[]) => {
  // Between [0, 1], 5 numbers for 5 tones.
  const scaleOfColor = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  const interpolator = interpolateYlGn
  const colors = scaleOfColor.map(x => interpolator(x))

  const getColor = scaleQuantile<string, number>()
    .domain(dataset)
    .range(colors)

  return getColor
}

export default defineComponent({
  name: 'BrazilRealStateFunds',

  components: {
    AssetBrowser,
    BrazilStatesMap,
    FundSelector,
    FundStateDetails,
    FundViewSwitcher,
    MapBrowser,
  },

  setup() {
    const isLoading = ref(false)
    const selectedStateCode = ref('')
    const selectedFund = ref('')
    const selectedView = ref('assets-count')
    const funds = ref([] as Fund[])
    const assets = ref([] as Asset[])
    const assetsPerStateService = ref([] as AssetsPerState[])
    const pathElementsMap = ref<{ [code: string] : Element | null;}>({})

    const selectedStateDetails = computed(() => {
      const state = assetsPerStateService.value.find(state => state.stateAcronym == selectedStateCode.value)
      return {
        acronym: state?.stateAcronym?? '',
        assetsCount: state?.assetsCount?? 0,
        totalSquareMeters: state?.totalSquareMeters?? 0,
      }
    })

    const selectedFundDetails = computed(() => {
      const fund = funds.value.find(f => f.acronym == selectedFund.value)
      return {...fund}
    })

    const statesSvgLoaded = async (pathMap: { [code: string] : Element | null; }) => {
      isLoading.value = true
      pathElementsMap.value = pathMap
      await sleep(400)
      funds.value = await fetchFunds()
      assetsPerStateService.value = await fetchAssetsPerStateService()
      colorizeMap()
      isLoading.value = false
    }

    const colorizeMap = () => {
      const mainValues = assetsPerStateService.value
        .map(getViewValue)
      const getColor = getColorFunction(mainValues)

      // Clear and set default color
      const statesValues = Object.entries(pathElementsMap.value)
      statesValues.forEach(([_, path]) => {
        path?.setAttribute('style', '')
        path?.setAttribute("fill", '#ccc')
      })

      assetsPerStateService.value.forEach(state => {
        const color = getColor(getViewValue(state)).toString()
        const pathElement = pathElementsMap.value[state.stateAcronym]
        if(!pathElement) {
          console.warn('Path element not found on pathElementMap', state.stateAcronym)
          return
        }
        const red = color
          .replace('rgb', '')
          .replace('(', '')
          .replace(')', '')
          .split(',')[0]
        if(parseInt(red) > 124) {
          pathElement.setAttribute('dark-mode', '')
        }
        //
        pathElement.setAttribute("fill", color)
      })
    }

    const getViewValue = (state: AssetsPerState) => {
      if(selectedView.value === 'square-meters') {
        return state.totalSquareMeters
      }
      return state.assetsCount
    }

    const stateClick = async (code: string) => {
      if(selectedStateCode.value == code) {
        selectedStateCode.value = ''
        await fetchAssetsWithQueryOnly()
        return
      }
      selectedStateCode.value = code
      await fetchAssetsWithQueryOnly()
    }

    const fundSelected = async (fundAcronym: string) => {
      selectedFund.value = fundAcronym
      isLoading.value = true
      await sleep(400)
      assetsPerStateService.value = await fetchAssetsPerStateService(selectedFund.value)
      colorizeMap()
      isLoading.value = false
      await fetchAssetsWithQueryOnly()
    }

    const viewSelected = async (view: string) => {
      selectedView.value = view
      isLoading.value = true
      await sleep(200)
      isLoading.value = false
      colorizeMap()
    }

    const fetchAssetsWithQueryOnly = async () => {
      if(selectedFund.value == '' && selectedStateCode.value == '') {
        assets.value = []
        return
      }
      assets.value = await fetchAssets({
        fundAcronym: selectedFund.value,
        stateAcronym: selectedStateCode.value,
      })
    }

    return {
      assets,
      isLoading,
      selectedStateCode,
      selectedFund,
      selectedFundDetails,
      selectedView,
      fundSelected,
      viewSelected,
      funds,
      selectedStateDetails,
      statesSvgLoaded,
      stateClick,
    }
  }
});
</script>

<style scoped>
.brazil-real-state-funds__map-container {
  position: relative;
}
</style>
