import * as d3 from "d3";
import StateGraphData from '@/interfaces/StateGraphData';
import StatesCsvSchema from '@/interfaces/StatesCsvSchema';

interface StyleParams {
  maxValue: number
}

const stateSchemaToGraph = (stateCsv: StatesCsvSchema): StateGraphData => {
  return {
    gdpPerCapita: parseFloat(stateCsv.pib_per_capita_brl),
    stateCode: stateCsv.sigla_uf
  }
}

export const fetchData = async () => {
  const response = await fetch(document.location.origin + '/pib-per-capita-estados-2019.csv')
    .then(response => response.text())
    .then(v => d3.csvParse(v)) as StatesCsvSchema[]

  return response.map(state => stateSchemaToGraph(state))
}

export const styleMap = (graphData: StateGraphData[], {maxValue}: StyleParams) => {
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
    (stateElement.element as any).style.setProperty('fill', getColor(stateElement.gdpPerCapita))
  })
}