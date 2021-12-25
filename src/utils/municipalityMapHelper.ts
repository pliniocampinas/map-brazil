import * as d3 from "d3";
import MunicipalitiesCsvSchema from '@/interfaces/MunicipalitiesCsvSchema';
import MunicipalitiesData from '@/interfaces/MunicipalitiesData';

const schemaToData = (municipalitiesCsvRow: MunicipalitiesCsvSchema): MunicipalitiesData => {
  return {
    year: parseInt(municipalitiesCsvRow.ano),
    gdpThousandsBrl: parseFloat(municipalitiesCsvRow.pib_bruto_1000),
    gdpPerCapitaBrl: parseFloat(municipalitiesCsvRow.pib_per_capita_1),
    state: municipalitiesCsvRow.sigla_uf,
    code: municipalitiesCsvRow.codigo_municipio,
    name: municipalitiesCsvRow.nome_municipio
  }
}

export const fetchData = async () => {
  const csvUrl = 'https://gist.githubusercontent.com/pliniocampinas/26a7afa913d4eeae1aad89d998718fd3/raw/22e235ce89032614cb3a17ccd9fbe970d704579a/pib-municipios-2019.csv'
  const response = await fetch(csvUrl)
    .then(response => response.text())
    .then(v => d3.csvParse(v)) as MunicipalitiesCsvSchema[]

  return response.map(state => schemaToData(state))
}