import AssetsPerState from "@/interfaces/AssetsPerState"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchData = async (fundAcronym = '') : Promise<AssetsPerState[]> => {
  let url = `${baseUrl}/funds/assets-per-state`
  if(fundAcronym) {
    url += '/?fund=' + fundAcronym
  }
  const response = await fetch(url)
    .then(response => response.json()) as AssetsPerState[]

  return response
}