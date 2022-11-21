<template>
  <div class="map__municipalities">
    <MapBrowser :isLoading="isLoading">
      <template v-slot:map-svg>
        <svg
          id="municipalities-svg"
          :width="width"
          :height="height"
        >
          <g>
            <path
              v-for="(visualizationData, index) in municipalitiesList2019"
              class="map__municipality"
              :d="path(visualizationData.feature)"
              :key="index"
              :description="visualizationData.name"
              :citycode="visualizationData.code"
              @click="handleClick(visualizationData)"
            >
              <title>{{ visualizationData.name }}</title>
            </path>
          </g>
        </svg>
      </template>

      <template v-slot:browser-options>
        <label for="select-visualizations">Visualization:</label>
        <SimpleSelect
          name="visualizations"
          id="select-visualizations"
          :options="visualizationOptions"
          @change="handleVisualizationChange"
        />
        <p><strong>Max value:</strong> {{ formatCurrencyBrl(maxValue) }}</p>
        <p><strong>Min value:</strong> {{ formatCurrencyBrl(minValue) }}</p>
        <TimelineControl
          :currentValue="selectedYear"
          :firstValue="FIRST_YEAR"
          :isPlaying="isPlaying"
          @play="playMap"
          @tick="handleTick"
        />
      </template>

      <template v-slot:browser-details>
        <h4>Municipality</h4>
        <template v-if="selectedCity.cityName">
          <p><strong>Name:</strong> {{ selectedCity.cityName }}</p>
          <p><strong>Gdp:</strong> {{ formatCurrencyBrl(selectedCity.cityGdp) }}</p>
          <p><strong>Gdp Per Capita:</strong> {{ formatCurrencyBrl(selectedCity.cityGdpPerCapita) }}</p>
        </template>
        <p v-else>
          Select a city to view details
        </p>
      </template>
    </MapBrowser>
  </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import { computed, defineComponent, onBeforeMount, ref, reactive, watch, nextTick } from 'vue';
import municipalitiesTopoJson from '@/assets/topojson-100-mun.json'
import { feature } from 'topojson-client'
import { GeometryObject, Topology } from 'topojson-specification';
import { geoPath, geoEqualEarth, min, max } from 'd3';
import { FeatureCollection, rewind } from '@turf/turf';
import { fetchData } from '@/repositories/MunicipalityRepository';
import { formatCurrencyBrl } from '@/utils/formatters';
import { sleep } from '@/utils/timeHelper';
import MunicipalitiesData from '@/interfaces/MunicipalitiesData';
import MapBrowser from '@/components/MapBrowser.vue';
import SimpleSelect from '@/components/SimpleSelect.vue';
import TimelineControl from '@/components/TimelineControl.vue';

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
  },

  setup() {
    const FIRST_YEAR = 2010
    const LAST_YEAR = 2019
    const width = 500
    const height = 550
    const visualizationOptions = [
      {
        label: 'Gdp per Capita',
        value: 'gdp-per-capita'
      },
      {
        label: 'Total Gdp(1000 BRL)',
        value: 'total-gdp'
      }
    ]
    const selectedVisualization = ref('gdp-per-capita')
    const selectedYear = ref(LAST_YEAR)
    const minValue = ref(0)
    const maxValue = ref(0)
    const isLoading = ref(false)
    const isPlaying = ref(false)
    const selectedCity = reactive({
      cityCode: "",
      cityName: "",
      cityGdp: 0,
      cityGdpPerCapita: 0,
    })

    const topology = (municipalitiesTopoJson as unknown) as Topology
    const geometries = municipalitiesTopoJson.objects['geojs-100-mun'] as GeometryObject
    const geoData = feature(topology, geometries) as FeatureCollection

    // Scale and translate to fit Brazil at the center of the projection
    const projection = geoEqualEarth()
      .scale(700)
      .translate([800, 80])

    const features = geoData.features?? []
    const municipalitiesList = ref<MunicipalitiesData[]>([])
    const municipalitiesList2019 = ref<MunicipalitiesData[]>([])

    // D3 expects geometry coordinates to be clockwise, 
    // otherwise some paths might be rendered too large 
    // turf rewind function handles this edge case
    features.forEach((feature) => {
      if(!feature.geometry) {
        return
      }
      // Mutate object
      feature.geometry = rewind(feature.geometry, {reverse:true})
    })

    onBeforeMount(async () => {
      await loadData()
    })

    const loadData = async () => {
      isLoading.value = true
      const data = await fetchData()
      isLoading.value = false
      municipalitiesList.value = data.map(municipality => {
        const municipalityFeature = features.find(feature => municipality.code === feature.properties?.id)
        return {
          ...municipality,
          feature: municipalityFeature
        }
      })
      municipalitiesList2019.value = municipalitiesList.value.filter(m => m.year === LAST_YEAR)

      computeDetails()
      nextTick(() => {
        colorizePaths()
      })
    }

    const handleClick = (municipality: MunicipalitiesData) => {
      selectedCity.cityCode = municipality.code
      selectedCity.cityName = municipality.name
      selectedCity.cityGdp = municipality.gdpThousandsBrl?? 0
      selectedCity.cityGdpPerCapita = municipality.gdpPerCapitaBrl?? 0
    }

    const handleVisualizationChange = (value: string) => {
      selectedVisualization.value = value
    }

    const getPathElement = (code: string) => {
      return document.querySelector(`path[citycode="${code}"]`)
    }

    const colorizePaths = () => {
      const mainValues = municipalitiesList.value
        .filter(d => d.year === selectedYear.value)
        .map(municipality => getMainAttribute(municipality))
      const getColor = getColorFunction(mainValues)
      currentVisualizationDataList.value.forEach(d => {
        const color = getColor(getMainAttribute(d))
        const pathElement = document.querySelector(`path[citycode="${d.code}"]`)
        if(pathElement) {
          pathElement.setAttribute("fill", color+'')
        }
      })
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
    
    const currentVisualizationDataList = computed(() => {
      return municipalitiesList.value.filter(d => d.year === selectedYear.value)
    })

    const playMap = async () => {
      isPlaying.value = true
      selectedYear.value = FIRST_YEAR
      while(selectedYear.value !== LAST_YEAR) {
        await sleep(700)
        selectedYear.value++
      }
      isPlaying.value = false
    }

    const handleTick = (index: number) => {
      selectedYear.value = FIRST_YEAR + index
    }

    watch(
      () => selectedCity.cityCode,
      (code, prevCode) => {
        if(prevCode) {
          const previouslySelectedPathElement = getPathElement(prevCode)
          previouslySelectedPathElement?.classList.remove('map__municipality--selected')
        }
        const selectedPathElement = getPathElement(code)
        selectedPathElement?.classList.add('map__municipality--selected')
      }
    )

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
      width,
      height,
      visualizationOptions,
      isLoading,
      isPlaying,
      minValue,
      maxValue,
      selectedCity,
      selectedYear,
      municipalitiesList2019,
      path: geoPath(projection),
      formatCurrencyBrl,
      handleClick,
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
</style>