import MunicipalitiesData from "@/interfaces/MunicipalitiesData"
import CityGdp from "../interfaces/CityGdp"
import { fetchJson } from "./HttpClient"

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

export const fetchData = async (year = 0) : Promise<MunicipalitiesData[]> => {
  const response = await fetchJson(`/cities/gdp${year?'?year='+year:''}`) as CityGdp[]

  return response.map(toMunicipality)
}