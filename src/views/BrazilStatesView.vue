<template>
  <div class="map__states">
    <div class="computed__browser">
      <h1>Pib per capita(R$)</h1>
      <h2>Min: {{ minValue }}</h2>
      <h2>Max: {{ maxValue }}</h2>
    </div>
    <BrazilStatesMap
      @loaded="statesSvgLoaded"
    >
    </BrazilStatesMap>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { fetchData, styleMap } from '@/utils/stateMapHelper';
import BrazilStatesMap from '@/components/BrazilStatesMap.vue';
import * as d3 from "d3";

export default defineComponent({
  name: 'BrazilStatesView',

  components: {
    BrazilStatesMap
  },

  setup() {
    const minValue = ref(0);
    const maxValue = ref(0);
    
    const statesSvgLoaded = async (e: any) => {
      const graphData = await fetchData();
      minValue.value = d3.min(graphData.map(state => state.gdpPerCapita)) || 0;
      maxValue.value = d3.max(graphData.map(state => state.gdpPerCapita)) || 0;
      styleMap(graphData, { maxValue: maxValue.value });
    }

    return {
      statesSvgLoaded,
      minValue,
      maxValue,
    }
  }
});
</script>

