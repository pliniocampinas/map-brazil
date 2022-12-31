import Asset from "@/interfaces/Asset"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

interface AssetQuery {
  stateAcronym: string
  fundAcronym: string
}

export const fetchData = async (query?: AssetQuery) : Promise<Asset[]> => {
  let url = `${baseUrl}/assets`
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
  const response = await fetch(url)
    .then(response => response.json()) as Asset[]

  return response
}