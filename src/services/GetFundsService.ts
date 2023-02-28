import Fund from "@/interfaces/Fund"
import { fetchJson } from "./HttpClient"

export const fetchData = async () : Promise<Fund[]> => {
  const response = await fetchJson('/funds/list') as Fund[]

  return response
}