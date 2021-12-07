<template>
  <div class="map__states">
    <div class="computed__browser">
      <h1>Pib per capita(R$)</h1>
      <h2>Min: {{ min_value }}</h2>
      <h2>Max: {{ max_value }}</h2>
    </div>
    <inline-svg 
        :src="require('../assets/brazil-states.svg')"
        @loaded="statesSvgLoaded($event)"
        @error="svgLoadError($event)"
        width="500" 
        fill="black"
        aria-label="Brazillian States Svg Map"
    ></inline-svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import InlineSvg from 'vue-inline-svg';
import * as d3 from "d3";

interface StatesCsvSchema {
  pib_per_capita_brl: string
  diferenca_posicao_2018: string
  posicao_2019: string
  razao_pib_per_capita_brasileiro: string
  sigla_uf: string
  unidade_federativa: string
}

interface StateGraphData {
  gdpPerCapita: number
  stateCode: string
}

const stateSchemaToGraph = (stateCsv: StatesCsvSchema): StateGraphData => {
  return {
    gdpPerCapita: parseFloat(stateCsv.pib_per_capita_brl),
    stateCode: stateCsv.sigla_uf
  }
}

export default defineComponent({
  name: 'BrazilStatesView',

  components: {
    InlineSvg
  },

  setup() {
    const stateList = ref([] as string[]);
    const width = 500;
    const height = 500;
    const min_value = ref(0);
    const max_value = ref(0);

    const graphData = ref([] as StateGraphData[]) 

    const svgLoadError = (e: any) => {
      console.log('svgLoadError', e)
    }

    const fetchData = async () => {
      const response = await fetch(document.location.origin + '/pib-per-capita-estados-2019.csv')
        .then(response => response.text())
        .then(v => d3.csvParse(v)) as StatesCsvSchema[]

      console.log('response', response)

      graphData.value = response.map(state => stateSchemaToGraph(state))
      min_value.value = d3.min(graphData.value.map(state => state.gdpPerCapita)) || 0;
      max_value.value = d3.max(graphData.value.map(state => state.gdpPerCapita)) || 0;
    }
    
    const statesSvgLoaded = async (e: any) => {
      const statePathElementSelector = '.map__states .estado path'

      stateList.value = [...document.querySelectorAll(statePathElementSelector)]
        .map(estado => estado.getAttribute('statecode') || '')
        .filter(estado => estado?.length > 0);

      await fetchData();

      const stateElements = [...document.querySelectorAll(statePathElementSelector)]
        .map(estado => {
          console.log('estado', estado)
          const stateCode = estado.getAttribute('statecode') || ''
          console.log('stateCode', stateCode)
          const stateData = graphData.value.find(state => state.stateCode === stateCode)
          return {
            gdpPerCapita: stateData?.gdpPerCapita || 0,
            stateCode: stateCode,
            element: estado
          }
        })
        .filter(estado => estado.stateCode?.length > 0);

      stateElements.sort((state1, state2) => state1.gdpPerCapita - state2.gdpPerCapita)
      const stateAmount = stateElements.length
      stateElements.forEach((stateElement, index) => {
        if(index < 5) {
          (stateElement.element as any).style.setProperty('fill', 'red')
          return
        }

        if(index >= (stateAmount - 5)) {
          (stateElement.element as any).style.setProperty('fill', 'darkgreen')
          return
        }
        
        (stateElement.element as any).style.setProperty('fill', 'lightgreen')
        return
      })
    }

    return {
      statesSvgLoaded,
      svgLoadError,
      stateList,
      width,
      min_value,
      max_value,
      graphData,
    }
  }
});
</script>

