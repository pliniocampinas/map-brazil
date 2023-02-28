import CityGeographicFeatures from "@/interfaces/CityGeographicFeatures"
import { fetchJson } from "./HttpClient"

export const fetchData = async () : Promise<CityGeographicFeatures[]> => {
  const response = await fetchJson('/cities/geo-features') as CityGeographicFeatures[]

  return response.map(city => {
    return {
      ...city,
      cityId: city.cityId.toString()
    }
  })
}