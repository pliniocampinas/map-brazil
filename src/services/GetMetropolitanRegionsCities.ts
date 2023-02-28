import MetropolitanRegionsCities from "@/interfaces/MetropolitanRegionsCities"
import { fetchJson } from "./HttpClient"

export const fetchData = async () : Promise<MetropolitanRegionsCities[]> => {
  const response = await fetchJson('/cities/metropolitan-regions') as MetropolitanRegionsCities[]

  return response
}