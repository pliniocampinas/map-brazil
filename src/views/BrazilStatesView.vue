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

interface StatesDictinarySchema {
  uf_nome_dash_case: string
  uf_sigla: string
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
      console.log('pib_per_capita_brl', graphData.value.map(state => state.gdpPerCapita))
      min_value.value = d3.min(graphData.value.map(state => state.gdpPerCapita)) || 0;
      max_value.value = d3.max(graphData.value.map(state => state.gdpPerCapita)) || 0;
    }
    
    const statesSvgLoaded = async (e: any) => {
      console.log('statesSvgLoaded', e)
      stateList.value = [...document.querySelectorAll('.map__states .estado')].map(estado => estado.getAttribute('xlink:href') || '');
      console.log('stateList ', stateList.value);

      await fetchData();
      
      const statesDictinary = await fetch(document.location.origin + '/dic_ufs.csv')
        .then(response => response.text())
        .then(v => d3.csvParse(v)) as StatesDictinarySchema[]

      console.log('statesDictinary', statesDictinary)

      const getStateCode = (stateName: string) => {
        const foundState = statesDictinary.find(state => {
          return state.uf_nome_dash_case.replace(/[^a-zA-Z]+/g, '')===stateName.replace(/[^a-zA-Z]+/g, '')
        })
        return foundState?.uf_sigla || ''
      }

      const stateElements = [...document.querySelectorAll('.map__states .estado')].map(estado => {
        return {
          stateCode: getStateCode(estado.getAttribute('xlink:href') || ''),
          href: estado.getAttribute('xlink:href') || '',
          element: estado
        }
      })
      console.log('stateElements', stateElements)
      stateElements.forEach(stateElement => {
        console.log(stateElement.element);
        // (stateElement.element as any).style.setProperty('fill', 'red')
        if(stateElement.stateCode !== `SP`) {
          return
        }
        (stateElement.element as any).querySelector(`path`).style.setProperty('fill', 'red')
      })
    }

    const x = d3
      .scaleBand()
      .domain(graphData.value.map(state => `${state.gdpPerCapita}`))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([min_value.value, max_value.value])
      .range([height, 0]);

    // var colors = d3.scaleQuantize()
    //   .domain([min_value.value, max_value.value])
    //     "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);

    return {
      // x,
      // y,
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

