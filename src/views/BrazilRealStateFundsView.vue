<template>
  <div class="brazil-real-state-funds">    
    <MapBrowser :isLoading="isLoading">
      <template v-slot:map-svg>
        <BrazilStatesMap
          class="brazil-real-state-funds__map"
          :selectedState="selectedStateCode"
          @state-click="stateClick"
          @path-map-loaded="statesSvgLoaded"
        >
        </BrazilStatesMap>
      </template>

      <template v-slot:browser-options>
        <div>
          <strong>Fundos: </strong>
          <select v-model="selectedFund">
            <option v-for="(fund, index) in funds" :value="fund.acronym" :key="index">
              {{fund.acronym}}
            </option>
          </select>
        </div>
      </template>

      <template v-slot:browser-details>
        <h4>Estado</h4>
        <template v-if="selectedStateCode">
          <p>
            {{ selectedStateDetails.acronym }}
          </p>
          <p>Número de ativos: {{ selectedStateDetails.assetsCount }}</p>
        </template>
        <template v-else>
          <p>
            Selecione um estado para ver detalhes
          </p>
          <p style="visibility: hidden;">Placeholder</p>
          <p style="visibility: hidden;">Placeholder</p>
        </template>
      </template>
    </MapBrowser>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { fetchData as fetchFunds } from '@/services/GetFundsService';
import { fetchData as fetchAssetsPerStateService } from '@/services/GetAssetsPerStateService';
import { sleep } from '@/utils/timeHelper';
import BrazilStatesMap from '@/components/BrazilStatesMap.vue';
import MapBrowser from '@/components/MapBrowser.vue';
import Fund from '@/interfaces/Fund';
import AssetsPerState from '@/interfaces/AssetsPerState';
import { interpolateYlGn, scaleQuantile } from 'd3';

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
    BrazilStatesMap,
    MapBrowser,
  },

  setup() {
    const isLoading = ref(false)
    const selectedStateCode = ref('')
    const selectedFund = ref('')
    const funds = ref([] as Fund[])
    const assetsPerStateService = ref([] as AssetsPerState[])
    const pathElementsMap = ref<{ [code: string] : Element | null;}>({})

    const selectedStateDetails = computed(() => {
      const state = assetsPerStateService.value.find(state => state.stateAcronym == selectedStateCode.value)
      return {
        acronym: state?.stateAcronym?? '',
        assetsCount: state?.assetsCount?? 0,
      }
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
        .map(state => state.assetsCount)
      const getColor = getColorFunction(mainValues)
      assetsPerStateService.value.forEach(s => {
        const color = getColor(s.assetsCount).toString()
        const pathElement = pathElementsMap.value[s.stateAcronym]
        if(!pathElement) {
          console.warn('Path element not found on pathElementMap', s.stateAcronym)
          return
        }
        console.log('color', color)
        const red = color
          .replace('rgb', '')
          .replace('(', '')
          .replace(')', '')
          .split(',')[0]
        if(parseInt(red) > 124) {
          pathElement.setAttribute('dark-mode', '')
        }
        //
        pathElement.setAttribute('style', '')
        pathElement.setAttribute("fill", color)
      })
    }

    const stateClick = (code: string) => {
      if(selectedStateCode.value == code) {
        selectedStateCode.value = ''
        return
      }
      selectedStateCode.value = code
    }

    return {
      isLoading,
      selectedStateCode,
      selectedFund,
      funds,
      selectedStateDetails,
      statesSvgLoaded,
      stateClick,
    }
  }
});
</script>

