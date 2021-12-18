<template>
  <div class="map__municipalities">
    <p>Municipalities</p>
    <div class="map__container">
       <svg :width="width" :height="height">
        <g>
          <path
            v-for="(feature, index) in features"
            class="municipality"
            :d="path(feature)"
            :key="index"
            :name="feature.properties.name"
            :index="index"
          >
          </path>
        </g>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import municipalitiesTopoJson from '@/assets/topojson-100-mun.json'
import { feature } from 'topojson-client'
import { GeometryObject, Topology } from 'topojson-specification';
import { geoPath, geoEqualEarth } from 'd3';
import { FeatureCollection, rewind } from '@turf/turf';

export default defineComponent({
  name: 'BrazilGeoMunicipalitiesView',

  components: {
  },

  setup() {
    const width = 500
    const height = 550

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
    features.forEach((feature: any) => {
      if(!feature.geometry) {
        return
      }
      // Mutate object
      feature.geometry = rewind(feature.geometry, {reverse:true})
    })

    return {
      width,
      height,
      features,
      path: geoPath(projection),
    }
  }
});
</script>

<style>
svg {
  border: 1px solid black;
}

.municipality {
  fill: red;
  stroke: #232323;
  stroke-width: 0.3;
}
</style>