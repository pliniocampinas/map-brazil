interface MetropolitanRegionDetails {
  MetropolitanRegionName: string
  StateAcronym: string
  Population: number
  TotalGdp1000Brl: number
  GdpPerCapitaBrlAverage: number
  TotalGdpBrlGrowthPercentAverage: number
  PopulationGrowthPercentAverage: number
}

export default interface MetropolitanRegionsDetails {
  nationalGdpPerCapitaBrlAverage: number
  nationalTotalGdpBrlGrowthPercentAverage: number
  nationalPopulationGrowthPercentAverage: number
  metropolitanRegions: MetropolitanRegionDetails[]
}