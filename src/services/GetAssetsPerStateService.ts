import AssetsPerState from "@/interfaces/AssetsPerState"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchData = async () : Promise<AssetsPerState[]> => {
  const response = await fetch(`${baseUrl}/funds/assets-per-state`)
    .then(response => response.json()) as AssetsPerState[]

  return response
}