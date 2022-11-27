import CityGeographicFeatures from "@/interfaces/CityGeographicFeatures"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchData = async () : Promise<CityGeographicFeatures[]> => {
  const response = await fetch(`${baseUrl}/cities/geo-features`)
    .then(response => response.json()) as CityGeographicFeatures[]

  return response.map(city => {
    return {
      ...city,
      cityId: city.cityId.toString()
    }
  })
}