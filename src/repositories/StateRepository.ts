import * as d3 from "d3";
import StateGraphData from '@/interfaces/StateGraphData';
import StatesCsvSchema from '@/interfaces/StatesCsvSchema';

const stateSchemaToGraph = (stateCsv: StatesCsvSchema): StateGraphData => {
  return {
    gdpPerCapita: parseFloat(stateCsv.pib_per_capita_brl),
    stateCode: stateCsv.sigla_uf
  }
}

export const fetchData = async () => {
  const csvUrl = 'https://gist.githubusercontent.com/pliniocampinas/17270d89ff1e99a91892e810a7d662b7/raw/43fdd17f3bf2d3d31239181ba79d72facef726bf/pib-per-capita-estados-2019.csv'
  const response = await fetch(csvUrl)
    .then(response => response.text())
    .then(v => d3.csvParse(v)) as StatesCsvSchema[]

  return response.map(state => stateSchemaToGraph(state))
}