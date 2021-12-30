<template>
  <div class="map__municipalities">
    <div class="map__municipalities__container">
      <div class="map__loading" v-if="isLoading">
        <LoadingBars/>
      </div>
      <svg :width="width" :height="height">
        <g>
          <path
            v-for="(feature, index) in pathProperties"
            class="map__municipality"
            :d="path(feature)"
            :key="index"
            :description="feature.properties.description"
            :citycode="feature.properties.id"
            :fill="getColor(feature.visualizationAttribute)"
            @click="handleClick(feature.properties)"
          >
            <title>{{ feature.properties.name }}</title>
          </path>
        </g>
      </svg>
    </div>
    <div class="map__municipalities__details">
      <label for="select-visualizations">Visualization:</label>
      <select
        name="visualizations"
        id="select-visualizations"
        @change="handleVisualizationChange"
      >
        <option
          v-for="opt in visualizationOptions"
          :value="opt.value"
          :key="opt.value"
        >
          {{opt.label}}
        </option>
      </select>
      <p><strong>Max value:</strong> {{ formatCurrencyBrl(maxValue) }}</p>
      <p><strong>Min value:</strong> {{ formatCurrencyBrl(minValue) }}</p>
      <h4>Municipality</h4>
      <template v-if="selectedCity.cityName">
        <p><strong>Name:</strong> {{ selectedCity.cityName }}</p>
        <p><strong>Gdp:</strong> {{ formatCurrencyBrl(selectedCity.cityGdp) }}</p>
        <p><strong>Gdp Per Capita:</strong> {{ formatCurrencyBrl(selectedCity.cityGdpPerCapita) }}</p>
      </template>
      <p v-else>
        None selected
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, reactive, watch } from 'vue';
import municipalitiesTopoJson from '@/assets/topojson-100-mun.json'
import { feature } from 'topojson-client'
import { GeometryObject, Topology } from 'topojson-specification';
import { geoPath, geoEqualEarth, min, max, ScaleQuantize, map } from 'd3';
import { FeatureCollection, rewind } from '@turf/turf';
import { fetchData, getColorFunction } from '@/utils/municipalityMapHelper';
import { formatCurrencyBrl } from '@/utils/formatters';
import LoadingBars from '@/components/LoadingBars.vue';

interface MunicipalitiesFeatureProperties {
  id: string
  name: string
  description: string
  gdp?: number
  state?: string
  gdpPerCapita?: number
}

export default defineComponent({
  name: 'BrazilMunicipalitiesView',

  components: {
    LoadingBars,
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
        label: 'Total Gdp',
        value: 'total-gdp'
      }
    ]
    const selectedVisualization = ref('gdp-per-capita')
    const minValue = ref(0)
    const maxValue = ref(0)
    const isLoading = ref(false)
    const getColor = ref(((n: number) => '#c3c3c3') as ScaleQuantize<string, number>)
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
      // Add new properties from gdp municipalities list
      isLoading.value = true
      const gdpList = await fetchData()
      isLoading.value = false
      features.forEach((feature) => {
        if(!feature.properties) {
          console.warn('This feature has no properties data')
          return
        }
        const gdpData = gdpList.find(d => d.code === feature.properties?.id)
        if(!gdpData) {
          console.warn('Municipality GDP data not found', feature.properties)
          return
        }
        // Mutate object
        feature.properties.gdp = gdpData.gdpThousandsBrl
        feature.properties.gdpPerCapita = gdpData.gdpPerCapitaBrl
        feature.properties.state = gdpData.state
      })

      minValue.value = min(gdpList.map(city => city.gdpPerCapitaBrl)) || 0;
      maxValue.value = max(gdpList.filter(city => city.gdpPerCapitaBrl < 120000).map(city => city.gdpPerCapitaBrl)) || 0;
      getColor.value = getColorFunction(maxValue.value)
    })

    const handleClick = (props: MunicipalitiesFeatureProperties) => {
      selectedCity.cityCode = props.id
      selectedCity.cityName = props.name
      selectedCity.cityGdp = props.gdp?? 0
      selectedCity.cityGdpPerCapita = props.gdpPerCapita?? 0
    }

    const handleVisualizationChange = ({ target }: { target: HTMLInputElement }) => {
      selectedVisualization.value = target.value
    }

    const getPathElement = (code: string) => {
      return document.querySelector(`path[citycode="${code}"]`)
    }
    
    const pathProperties = computed(() => {
      return features.map(feature => {
        if(selectedVisualization.value === 'gdp-per-capita') {
          return {
            ...feature,
            visualizationAttribute: feature.properties?.gdpPerCapita
          }
        }
        if(selectedVisualization.value === 'total-gdp') {
          return {
            ...feature,
            visualizationAttribute: feature.properties?.gdp
          }
        }
      })
    })
    
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

    return {
      width,
      height,
      visualizationOptions,
      isLoading,
      minValue,
      maxValue,
      selectedCity,
      pathProperties,
      path: geoPath(projection),
      getColor,
      formatCurrencyBrl,
      handleClick,
      handleVisualizationChange,
    }
  }
});
</script>

<style>
.map__municipalities {
  display: grid;
  grid-template-columns: 1fr 200px;
  max-width: 750px;
  margin: auto;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: relative;
}

.map__municipalities__container {
  background-color: #f9f9f9;
}

.map__loading {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(200, 200, 200, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
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

.map__municipalities__details {
  padding: 24px;
  text-align: left;
  background-color: #e3e3e3;
}

.map__municipalities__details p {
  font-size: 12px;
}
</style>