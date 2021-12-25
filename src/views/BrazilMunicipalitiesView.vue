<template>
  <div class="map__municipalities">
    <h2 class="map__municipalities__title">
      Municipalities
    </h2>
    <div class="map__municipalities__container">
       <svg :width="width" :height="height">
        <g>
          <path
            v-for="(feature, index) in features"
            class="map__municipality"
            :d="path(feature)"
            :key="index"
            :description="feature.properties.description"
            :citycode="feature.properties.id"
            @mouseover="handleMouseOver(feature.properties)"
            @mouseleave="handleMouseLeave(feature.properties)"
          >
          </path>
        </g>
      </svg>
    </div>
    <div class="map__municipalities__details">
      <h4>Municipality</h4>
      <template v-if="hoveredCityName">
        <p>{{ hoveredCityName }}</p>
        <p>{{ hoveredCityGdp.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) }}</p>
      </template>
      <p v-else>
        None selected
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import municipalitiesTopoJson from '@/assets/topojson-100-mun.json'
import { feature } from 'topojson-client'
import { GeometryObject, Topology } from 'topojson-specification';
import { geoPath, geoEqualEarth, min, max } from 'd3';
import { FeatureCollection, rewind } from '@turf/turf';
import { fetchData } from '@/utils/municipalityMapHelper';

interface MunicipalitiesFeatureProperties {
  id: string
  name: string
  description: string
  gdp?: number
  state?: string
}

export default defineComponent({
  name: 'BrazilMunicipalitiesView',

  components: {
  },

  setup() {
    const width = 500
    const height = 550
    const minValue = ref(0);
    const maxValue = ref(0);
    const hoveredCityName = ref("")
    const hoveredCityGdp = ref(0)

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

    onMounted(async () => {
      // Add new properties from gdp municipalities list
      const gdpList = await fetchData()
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
        feature.properties.state = gdpData.state
      })

      minValue.value = min(gdpList.map(city => city.gdpThousandsBrl)) || 0;
      maxValue.value = max(gdpList.map(city => city.gdpThousandsBrl)) || 0;
    })

    const handleMouseOver = (props: MunicipalitiesFeatureProperties) => {
      hoveredCityName.value = props.name
      hoveredCityGdp.value = props.gdp?? 0
    }
    const handleMouseLeave = (props: MunicipalitiesFeatureProperties) => {
      hoveredCityName.value = ""
      hoveredCityGdp.value = 0
    }

    return {
      width,
      height,
      hoveredCityName,
      hoveredCityGdp,
      features,
      path: geoPath(projection),
      handleMouseOver,
      handleMouseLeave,
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
}

.map__municipalities__title {
  grid-column: span 2;
}

svg {
  border: 1px solid black;
}

.map__municipality {
  fill: #2ca25f;
  stroke: #232323;
  stroke-width: 0.3;
}

.map__municipality:hover {
  opacity: 0.7;
  stroke-width: 1.5;
  stroke: #cccccc;
}
</style>