import { sleep } from "@/utils/timeHelper"

const baseUrl = process.env.VUE_APP_CITIES_API_URL ?? ''

export const fetchJson = async (relativeUrl: string) => {

  if(process.env.VUE_APP_REQUEST_DELAY) {
    await sleep(process.env.VUE_APP_REQUEST_DELAY)
  }

  return fetch(baseUrl + relativeUrl)
    .then(response => response.json())
}