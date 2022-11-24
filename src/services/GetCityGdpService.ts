import MunicipalitiesData from "@/interfaces/MunicipalitiesData"
import CityGdp from "../interfaces/CityGdp"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

const toMunicipality = (city: CityGdp) => {
  return {
    year: city.year,
    gdpThousandsBrl: city.totalGdp1000Brl,
    gdpPerCapitaBrl: city.gdpPerCapitaBrl,
    state: city.stateAcronym,
    code: city.cityId+'',
    name: city.cityName,
  }
}

export const fetchData = async () : Promise<MunicipalitiesData[]> => {
  const response = await fetch(`${baseUrl}/cities/gdp`)
    .then(response => response.json()) as CityGdp[]

  return response.map(toMunicipality)
}