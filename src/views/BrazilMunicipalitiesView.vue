<template>
  <div class="map__municipalities">
    <MapBrowser :isLoading="isLoading">
      <template v-slot:map-svg>
        <BrazilMunicipalitiesMap
          class="map__municipalities__map"
          :selectedCityCode="selectedCityCode"
          @city-click="cityClick"
          @path-map-loaded="pathMapLoaded"
        >
        </BrazilMunicipalitiesMap>
      </template>

      <template v-slot:browser-options>
        <div>
          <label for="select-visualizations">Visualização:</label>
          <SimpleSelect
            name="visualizations"
            id="select-visualizations"
            :options="visualizationOptions"
            @change="handleVisualizationChange"
          />
        </div>
        <p class="my-1"><strong>Valor max:</strong> {{ formatCurrencyBrl(maxValue) }}</p>
        <p class="my-1"><strong>Valor min:</strong> {{ formatCurrencyBrl(minValue) }}</p>
        <TimelineControl
          :currentValue="selectedYear"
          :firstValue="FIRST_YEAR"
          :isPlaying="isPlaying"
          @play="playMap"
          @tick="handleTick"
        />
      </template>

      <template v-slot:browser-details>
        <h4>Município</h4>
        <template v-if="selectedCity.cityName">
          <p><strong>Nome:</strong> {{ selectedCity.cityName }}</p>
          <p><strong>PIB:</strong> {{ formatCurrencyBrl(selectedCity.cityGdp) }}</p>
          <p><strong>PIB per capita:</strong> {{ formatCurrencyBrl(selectedCity.cityGdpPerCapita) }}</p>
        </template>
        <template v-else>
          <p>
            Selecione uma cidade para ver detalhes
          </p>
          <p style="visibility: hidden;">Placeholder</p>
          <p style="visibility: hidden;">Placeholder</p>
        </template>
      </template>
    </MapBrowser>
  </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import { computed, defineComponent, ref, reactive, watch, nextTick } from 'vue';
import { fetchData } from '@/services/GetCityGdpService';
import { formatCurrencyBrl } from '@/utils/formatters';
import { sleep } from '@/utils/timeHelper';
import MunicipalitiesData from '@/interfaces/MunicipalitiesData';
import MapBrowser from '@/components/MapBrowser.vue';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';
import SimpleSelect from '@/components/SimpleSelect.vue';
import TimelineControl from '@/components/TimelineControl.vue';
import { max, min } from "d3";

const getColorFunction = (dataset: number[]) => {
  // Between [0, 1], 5 numbers for 5 tones.
  const scaleOfColor = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  const interpolator = d3.interpolateRdYlGn
  const colors = scaleOfColor.map(x => interpolator(x))

  const getColor = d3.scaleQuantile<string, number>()
    .domain(dataset)
    .range(colors)

  return getColor
}

export default defineComponent({
  name: 'BrazilMunicipalitiesView',

  components: {
    MapBrowser,
    SimpleSelect,
    TimelineControl,
    BrazilMunicipalitiesMap
  },

  setup() {
    const FIRST_YEAR = 2010
    const LAST_YEAR = 2019
    const visualizationOptions = [
      {
        label: 'PIB per Capita',
        value: 'gdp-per-capita'
      },
      {
        label: 'PIB Nominal(1000 BRL)',
        value: 'total-gdp'
      }
    ]
    const selectedVisualization = ref('gdp-per-capita')
    const selectedYear = ref(LAST_YEAR)
    const minValue = ref(0)
    const maxValue = ref(0)
    const isLoading = ref(false)
    const isPlaying = ref(false)
    const pathElementsMap = ref<{ [code: string] : Element | null;}>({})
    const selectedCityCode = ref('')
    const selectedCity = reactive({
      cityCode: "",
      cityName: "",
      cityGdp: 0,
      cityGdpPerCapita: 0,
    })
    const municipalitiesList = ref<MunicipalitiesData[]>([])
    const municipalitiesList2019 = ref<MunicipalitiesData[]>([])

    const loadData = async () => {
      isLoading.value = true
      try {
        const data = await fetchData()
        municipalitiesList.value = data
        municipalitiesList2019.value = municipalitiesList.value.filter(m => m.year === LAST_YEAR)
        isLoading.value = false

        computeDetails()
        nextTick(() => {
          colorizePaths()
        })
      } catch(err) {
        isLoading.value = false
      }
    }

    const handleVisualizationChange = (value: string) => {
      selectedVisualization.value = value
    }

    const colorizePaths = () => {
      const mainValues = municipalitiesList.value
        .filter(d => d.year === selectedYear.value)
        .map(municipality => getMainAttribute(municipality))
      const getColor = getColorFunction(mainValues)
      currentVisualizationDataList.value.forEach(d => {
        const color = getColor(getMainAttribute(d))
        if(!d.pathElement) {
          d.pathElement = pathElementsMap.value[d.code]
        }
        if(d.pathElement) {
          d.pathElement.setAttribute("fill", color+'')
        }
      })
    }

    const cityClick = (code: string) => {
      if(selectedCityCode.value == code) {
        selectedCityCode.value = ''
        return
      }
      selectedCityCode.value = code;
      const city = municipalitiesList.value.find(city => city.year===selectedYear.value && city.code===code)
      selectedCity.cityCode = city?.code??''
      selectedCity.cityName = city?.name??''
      selectedCity.cityGdp = city?.gdpThousandsBrl?? 0
      selectedCity.cityGdpPerCapita = city?.gdpPerCapitaBrl?? 0
    }

    const computeDetails = () => {
      const mainValues = municipalitiesList.value
        .filter(d => d.year === selectedYear.value)
        .map(municipality => getMainAttribute(municipality))
      minValue.value = min(mainValues) || 0;
      maxValue.value = max(mainValues) || 0;
    }

    const getMainAttribute = (municipality: MunicipalitiesData) => {
      if(selectedVisualization.value === 'gdp-per-capita' || selectedVisualization.value === '') {
        return municipality.gdpPerCapitaBrl
      }
      if(selectedVisualization.value === 'total-gdp') {
        return municipality.gdpThousandsBrl
      }
      return 0
    }

    const pathMapLoaded = (pathMap: { [code: string] : Element | null; }) => {
      pathElementsMap.value = pathMap
      loadData()
        .then(() => colorizePaths())
    }
    
    const currentVisualizationDataList = computed(() => {
      return municipalitiesList.value.filter(d => d.year === selectedYear.value)
    })

    const playMap = async () => {
      isPlaying.value = true
      selectedYear.value = FIRST_YEAR
      while(selectedYear.value !== LAST_YEAR) {
        await sleep(800)
        selectedYear.value++
      }
      isPlaying.value = false
    }

    const handleTick = (index: number) => {
      selectedYear.value = FIRST_YEAR + index
    }

    watch(selectedVisualization, () => {
      computeDetails()
      colorizePaths()
    })

    watch(selectedYear, () => {
      computeDetails()
      colorizePaths()
    })

    return {
      FIRST_YEAR,
      visualizationOptions,
      isLoading,
      isPlaying,
      minValue,
      maxValue,
      selectedCityCode,
      selectedCity,
      selectedYear,
      municipalitiesList2019,
      cityClick,
      pathMapLoaded,
      formatCurrencyBrl,
      handleVisualizationChange,
      playMap,
      handleTick,
    }
  }
});
</script>

<style>
.map__municipalities {
  max-width: 750px;
  margin: auto;
}

.map__municipality {
  stroke: #232323;
  stroke-width: 0;
  cursor: pointer;
}

.map__municipality:hover,
.map__municipality--selected {
  opacity: 0.7;
  stroke-width: 3;
  stroke: #cccccc;
}

.map__municipalities__map {
  height: 500px;
}
</style>