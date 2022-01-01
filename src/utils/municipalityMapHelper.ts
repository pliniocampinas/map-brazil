import * as d3 from "d3";
import MunicipalitiesCsvSchema from '@/interfaces/MunicipalitiesCsvSchema';
import MunicipalitiesData from '@/interfaces/MunicipalitiesData';

const parseBrlCurrency = (currency: string): number => {
  return parseFloat(
    currency
      .replace('.', '')
      .replace(',', '.')
  )
}

const schemaToData = (municipalitiesCsvRow: MunicipalitiesCsvSchema): MunicipalitiesData => {
  return {
    year: parseInt(municipalitiesCsvRow.ano),
    gdpThousandsBrl: parseFloat(municipalitiesCsvRow.pib_bruto_1000brl),
    gdpPerCapitaBrl: parseBrlCurrency(municipalitiesCsvRow.pib_per_capita_1brl),
    state: municipalitiesCsvRow.sigla_uf,
    code: municipalitiesCsvRow.codigo_municipio,
    name: municipalitiesCsvRow.nome_municipio
  }
}

export const fetchData = async () => {
  const csvUrl = 'https://gist.githubusercontent.com/pliniocampinas/3a0b327dbe7180dd984352e1be4b86e9/raw/4c89ca9aa4d46fbb4630e892613492e8593879b0/pib-municipios-2010-2019.csv'
  const response = await fetch(csvUrl)
    .then(response => response.text())
    .then(v => d3.csvParse(v)) as MunicipalitiesCsvSchema[]

  return response.map(state => schemaToData(state))
}

export const getColorFunction = (dataset: number[]) => {
  // Between [0, 1], 5 numbers for 5 tones.
  const scaleOfColor = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  const interpolator = d3.interpolateRdYlGn
  const colors = scaleOfColor.map(x => interpolator(x))

  const getColor = d3.scaleQuantile<string, number>()
    .domain(dataset)
    .range(colors)

  return getColor
}