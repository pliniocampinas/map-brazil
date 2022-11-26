<template>
  <div class="map__municipalities">
    <MapBrowser :isLoading="isLoading">
      <template v-slot:map-svg>
        <svg>
          <g>
            <path
              v-for="(visualizationData, index) in municipalitiesList"
              class="map__municipality"
              :d="path(visualizationData.feature)"
              :key="index"
              :description="visualizationData.name"
              :citycode="visualizationData.code"
            >
              <title>{{ visualizationData.name }}</title>
            </path>
          </g>
        </svg>
      </template>

      <template v-slot:browser-options>
      </template>

      <template v-slot:browser-details>
      </template>
    </MapBrowser>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue';
import municipalitiesTopoJson from '@/assets/topojson-100-mun.json'
import { feature } from 'topojson-client'
import { GeometryObject, Topology } from 'topojson-specification';
import { geoPath, geoEqualEarth } from 'd3';
import { FeatureCollection, rewind } from '@turf/turf';
import { fetchData } from '@/services/GetCityGdpService';
import MunicipalitiesData from '@/interfaces/MunicipalitiesData';
import MapBrowser from '@/components/MapBrowser.vue';

export default defineComponent({
  name: 'RenderBrazilMapView',

  components: {
    MapBrowser,
  },

  setup() {
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
      try {
        const data = await fetchData(2019)
        municipalitiesList.value = data.map(municipality => {
        const municipalityFeature = features.find(feature => municipality.code === feature.properties?.id)
          return {
            ...municipality,
            feature: municipalityFeature
          }
        })

      } catch(err) {
        console.log(err)
      }
    }

    return {
      path: geoPath(projection),
      municipalitiesList,
    }
  }
});
</script>

<style>
#municipalities-svg {
  width:  auto;
  height: 400px;
}
</style>