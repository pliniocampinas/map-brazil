import Asset from "@/interfaces/Asset"
import { fetchJson } from "./HttpClient"

interface AssetQuery {
  stateAcronym: string
  fundAcronym: string
}

export const fetchData = async (query?: AssetQuery) : Promise<Asset[]> => {
  let url = '/assets'
  if(query) {
    url += '/?'
    const params = new URLSearchParams();
    if(query.fundAcronym) {
      params.append('fund', query.fundAcronym)
    }
    if(query.stateAcronym) {
      params.append('state', query.stateAcronym)
    }
    url += params.toString()
  }
  const response = await fetchJson(url) as Asset[]

  return response
}