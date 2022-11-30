import GeographicFeatureStats from "@/interfaces/GeographicFeatureStats"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchData = async (featureName: string) : Promise<GeographicFeatureStats> => {
  const response = await fetch(`${baseUrl}/cities/features-stats/${featureName}`)
    .then(response => response.json()) as GeographicFeatureStats

  return response
}