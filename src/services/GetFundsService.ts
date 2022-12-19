import Fund from "@/interfaces/Fund"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchData = async () : Promise<Fund[]> => {
  const response = await fetch(`${baseUrl}/funds/list`)
    .then(response => response.json()) as Fund[]

  return response
}