import AssetsPerCity from "@/interfaces/AssetsPerCity"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchData = async (fundAcronym = '') : Promise<AssetsPerCity[]> => {
  let url = `${baseUrl}/funds/assets-per-city`
  if(fundAcronym) {
    url += '/?fund=' + fundAcronym
  }
  const response = await fetch(url)
    .then(response => response.json()) as AssetsPerCity[]

  return response
}