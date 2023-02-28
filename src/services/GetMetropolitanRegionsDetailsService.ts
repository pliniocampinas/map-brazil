import MetropolitanRegionsDetails from "@/interfaces/MetropolitanRegionsDetails"
import { fetchJson } from "./HttpClient"

export const fetchData = async () : Promise<MetropolitanRegionsDetails> => {
  const response = await fetchJson('/cities/metropolitan-regions-details') as MetropolitanRegionsDetails

  return response
}