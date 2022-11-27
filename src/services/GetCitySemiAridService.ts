import CitySemiArid from "@/interfaces/CitySemiArid"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchData = async () : Promise<CitySemiArid[]> => {
  const response = await fetch(`${baseUrl}/cities/is-semi-arid`)
    .then(response => response.json()) as CitySemiArid[]

  return response.map(city => {
    return {
      ...city,
      cityId: city.cityId.toString()
    }
  })
}