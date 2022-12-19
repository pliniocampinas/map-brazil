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
        <h4>browser-details</h4>
      </template>
    </MapBrowser>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { fetchData as fetchFunds } from '@/services/GetFundsService';
import { sleep } from '@/utils/timeHelper';
import BrazilStatesMap from '@/components/BrazilStatesMap.vue';
import MapBrowser from '@/components/MapBrowser.vue';
import Fund from '@/interfaces/Fund';

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

    const statesSvgLoaded = async (pathMap: { [code: string] : Element | null; }) => {
      isLoading.value = true
      pathMap['PA']?.setAttribute("style", '')
      pathMap['PA']?.setAttribute("fill", 'red')
      await sleep(400)
      funds.value = await fetchFunds()
      isLoading.value = false
    }

    const stateClick = (code: string) => {
      console.log('state click', code)
    }

    return {
      isLoading,
      selectedStateCode,
      selectedFund,
      funds,
      statesSvgLoaded,
      stateClick,
    }
  }
});
</script>

