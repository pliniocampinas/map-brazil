<template>
  <div class="semi-arid">
    <div class="semi-arid__container">
      <BrazilMunicipalitiesMap
        @loaded="svgLoaded"
        class="semi-arid__map"
      >
      </BrazilMunicipalitiesMap>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';

export default defineComponent({
  name: 'SemiAridView',

  components: {
    BrazilMunicipalitiesMap,
  },

  setup() {

    return {
      svgLoaded: () => console.log('svgLoaded'),
      svgLoadError: () => console.log('svgLoadError'),
    }
  }
});
</script>

<style>
.semi-arid {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 750px;
  margin: auto;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: relative;
}

.semi-arid__container {
  background-color: #f9f9f9;
}

.semi-arid__map {
  height: 500px;
}
</style>