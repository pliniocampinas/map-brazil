import AssetsPerCity from "@/interfaces/AssetsPerCity"
import { fetchJson } from "./HttpClient"

export const fetchData = async (fundAcronym = '') : Promise<AssetsPerCity[]> => {
  let url = '/funds/assets-per-city'
  if(fundAcronym) {
    url += '/?fund=' + fundAcronym
  }
  const response = await fetchJson(url) as AssetsPerCity[]

  return response
}