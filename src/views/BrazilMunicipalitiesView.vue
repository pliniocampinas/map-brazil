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
              v-for="(visualizationData, index) in visualizationDataList"
              class="map__municipality"
              :d="path(visualizationData.feature)"
              :key="index"
              :description="visualizationData.name"
              :citycode="visualizationData.code"
              :fill="visualizationData.color"
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
        <div class="timeline-control">
          <label>Year: {{selectedYear}}</label>
          <input type="range" min="2010" max="2019" v-model.number="selectedYear" style="width: 80%;">
          <button @click="playMap" :disabled="isPlaying">Play</button>
        </div>
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
import { computed, defineComponent, onBeforeMount, ref, reactive, watch } from 'vue';
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
  },

  setup() {
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
    const selectedYear = ref(2019)
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

      computeDetails()
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
    
    const visualizationDataList = computed(() => {
      const mainValues = municipalitiesList.value
        .map(municipality => getMainAttribute(municipality))
        .map(value => value > 0? value: 0)
      const getColor = getColorFunction(mainValues)
      return municipalitiesList.value
        .filter(d => d.year === selectedYear.value)
        .map(municipality => {
        return {
          ...municipality,
          visualizationAttribute: getMainAttribute(municipality),
          color: getColor(getMainAttribute(municipality))
        }
      })
    })

    const playMap = async () => {
      isPlaying.value = true
      selectedYear.value = 2010
      while(selectedYear.value !== 2019) {
        await sleep(700)
        selectedYear.value++
      }
      isPlaying.value = false
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
    })

    watch(selectedYear, () => {
      computeDetails()
    })

    return {
      width,
      height,
      visualizationOptions,
      isLoading,
      isPlaying,
      minValue,
      maxValue,
      selectedCity,
      selectedYear,
      visualizationDataList,
      path: geoPath(projection),
      formatCurrencyBrl,
      handleClick,
      handleVisualizationChange,
      playMap,
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

.timeline-control {
  width: 100%;
}

.map__municipality:hover,
.map__municipality--selected {
  opacity: 0.7;
  stroke-width: 3;
  stroke: #cccccc;
}
</style>