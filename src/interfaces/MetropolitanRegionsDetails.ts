interface MetropolitanRegionDetails {
  metropolitanRegionName: string
  stateAcronym: string
  population: number
  totalGdp1000Brl: number
  gdpPerCapitaBrlAverage: number
  totalGdpBrlGrowthPercentAverage: number
  populationGrowthPercentAverage: number
}

export default interface MetropolitanRegionsDetails {
  nationalGdpPerCapitaBrlAverage: number
  nationalTotalGdpBrlGrowthPercentAverage: number
  nationalPopulationGrowthPercentAverage: number
  metropolitanRegions: MetropolitanRegionDetails[]
}