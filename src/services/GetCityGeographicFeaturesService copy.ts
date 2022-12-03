import MetropolitanRegionsCities from "@/interfaces/MetropolitanRegionsCities"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchData = async () : Promise<MetropolitanRegionsCities> => {
  const response = await fetch(`${baseUrl}/cities/geo-features`)
    .then(response => response.json()) as MetropolitanRegionsCities

    return response
}