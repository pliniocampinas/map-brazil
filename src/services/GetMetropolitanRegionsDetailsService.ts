import MetropolitanRegionsDetails from "@/interfaces/MetropolitanRegionsDetails"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchData = async () : Promise<MetropolitanRegionsDetails> => {
  const response = await fetch(`${baseUrl}/cities/metropolitan-regions-details`)
    .then(response => response.json()) as MetropolitanRegionsDetails

    return response
}