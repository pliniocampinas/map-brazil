import GeographicFeatureStats from "@/interfaces/GeographicFeatureStats"
import { fetchJson } from "./HttpClient"

export const fetchData = async (featureName: string) : Promise<GeographicFeatureStats> => {
  const response = await fetchJson(`/cities/features-stats/${featureName}`) as GeographicFeatureStats

  return response
}