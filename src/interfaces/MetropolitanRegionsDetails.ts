interface MetropolitanRegionDetails {
  metropolitanRegionName: string
  stateAcronym: string
  oopulation: number
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