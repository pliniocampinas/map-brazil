import AssetsPerState from "@/interfaces/AssetsPerState"
import { fetchJson } from "./HttpClient"

export const fetchData = async (fundAcronym = '') : Promise<AssetsPerState[]> => {
  let url = '/funds/assets-per-state'
  if(fundAcronym) {
    url += '/?fund=' + fundAcronym
  }
  const response = await fetchJson(url) as AssetsPerState[]

  return response
}