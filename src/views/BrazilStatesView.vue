<template>
  <div class="map__states">
    <div class="computed__browser">
      <h1>Pib per capita(R$)</h1>
      <h2>Min: {{ formatCurrencyBrl(minValue) }}</h2>
      <h2>Max: {{ formatCurrencyBrl(maxValue) }}</h2>
    </div>
    
    <BrazilStatesMap
      class="map__states__map"
      :selectedState="selectedStateCode"
      @state-click="stateClick"
      @path-map-loaded="statesSvgLoaded"
    >
    </BrazilStatesMap>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { fetchData } from '@/repositories/StateRepository';
import { formatCurrencyBrl } from '@/utils/formatters';
import BrazilStatesMap from '@/components/BrazilStatesMap.vue';
import * as d3 from "d3";
import StateGraphData from '@/interfaces/StateGraphData';

interface StyleParams {
  maxValue: number
}

const styleMap = (graphData: StateGraphData[], {maxValue}: StyleParams) => {
  const statePathElementSelector = '.map__states .estado path'
    // Set array with data
  const stateElements = [...document.querySelectorAll(statePathElementSelector)]
      .map(estado => {
        const stateCode = estado.getAttribute('statecode') || ''
        const stateData = graphData.find(state => state.stateCode === stateCode)
        return {
          gdpPerCapita: stateData?.gdpPerCapita || 0,
          stateCode: stateCode,
          element: estado
        }
      })
      .filter(estado => estado.stateCode?.length > 0);

  // Prepare interpolator and scale.

  // Between [0, 1], 5 numbers for 5 tones.
  const scaleOfColor = [0, 0.3, 0.6, 0.8, 1]
  const interpolator = d3.interpolateRdYlGn;
  const colors = scaleOfColor.map(x => interpolator(x));

  const getColor = d3.scaleQuantize<string, number>()
    .domain([0, maxValue])
    .range(colors);

  // Style: Set colors
  stateElements.forEach(stateElement => {
    (stateElement.element as SVGElement).style.setProperty('fill', getColor(stateElement.gdpPerCapita) as string)
  })
}

export default defineComponent({
  name: 'BrazilStatesView',

  components: {
    BrazilStatesMap
  },

  setup() {
    const selectedStateCode = ref('')
    const minValue = ref(0);
    const maxValue = ref(0);
    
    const statesSvgLoaded = async () => {
      const graphData = await fetchData();
      minValue.value = d3.min(graphData.map(state => state.gdpPerCapita)) || 0;
      maxValue.value = d3.max(graphData.map(state => state.gdpPerCapita)) || 0;
      styleMap(graphData, { maxValue: maxValue.value });
    }

    const stateClick = (code: string) => {
      if(selectedStateCode.value == code) {
        selectedStateCode.value = ''
        return
      }
      selectedStateCode.value = code;
    }

    return {
      selectedStateCode,
      statesSvgLoaded,
      stateClick,
      formatCurrencyBrl,
      minValue,
      maxValue,
    }
  }
});
</script>

