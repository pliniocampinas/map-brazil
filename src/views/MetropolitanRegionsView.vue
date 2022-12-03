<template>
  <div class="metropolitan-regions">
    <div class="metropolitan-regions__container">
      <div class="metropolitan-regions__loading" v-if="isLoading">
        <LoadingBars/>
      </div>
      <BrazilMunicipalitiesMap
        class="metropolitan-regions__map"
        :selectedCityCode="selectedCity"
        @loaded="svgLoaded"
        @city-click="cityClick"
        @path-map-loaded="pathMapLoaded"
      >
      </BrazilMunicipalitiesMap>
      <div class="metropolitan-regions__labels">
        <div class="metropolitan-regions__label">
          <span class="metropolitan-regions__label__text">
          Clique em um dos labels para ver detalhes
          </span>
        </div>
        <div class="metropolitan-regions__label metropolitan-regions--hover"
          v-for="(feature, index) in displayedFeatures"
          :key="index"
          @click="showFeatureDetails(feature.key)"
        >
          <span class="metropolitan-regions__label__text metropolitan-regions--hover">
          {{feature.label}}
          </span>
          <span class="metropolitan-regions__label__box blink" :style="`background-color:${feature.color};`"></span>
        </div>
      </div>
    </div>
    <div class="metropolitan-regions-details__container">
      <h1 class="metropolitan-regions-details__heading">Detalhes {{ selectedMetropolitanRegion }}</h1>
    </div>
  </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import { defineComponent, ref } from 'vue';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';
import LoadingBars from '@/components/LoadingBars.vue';
import { fetchData } from '@/services/GetMetropolitanRegionsCities';
import { sleep } from '@/utils/timeHelper';
import MetropolitanRegionsCities from '@/interfaces/MetropolitanRegionsCities';

export default defineComponent({
  name: 'MetropolitanRegionsView',

  components: {
    BrazilMunicipalitiesMap,
    LoadingBars,
  },

  setup() {
    const displayedFeatures = [
      {
        label: 'Região metropolitana',
        key: 'metropolitan',
        color: 'rgb(50, 50, 180)',
      },
      {
        label: 'Não metropolitana',
        key: 'non-metropolitan',
        color: 'rgb(50, 172, 50)',
      },
    ]
    const selectedCity = ref('')
    const selectedMetropolitanRegion = ref('')
    const isLoading = ref(false)
    const municipalitiesList = ref<MetropolitanRegionsCities[]>([])
    const metropolitanRegionColorMap = ref<{color: string, name: string}[]>([])

    const loadData = async () => {
      isLoading.value = true
      await sleep(500)
      try {
        const data = await fetchData()
        const uniqueMetropolitanRegionsSet = new Set<string>()
        for (const city of data) {
          uniqueMetropolitanRegionsSet.add(city.metropolitanRegionName)
        }
        const uniqueMetropolitanRegions = Array.from(uniqueMetropolitanRegionsSet)
        metropolitanRegionColorMap.value = getMetropolitanRegionColorMap(uniqueMetropolitanRegions)
        municipalitiesList.value = data
        isLoading.value = false
      } catch(err) {
        isLoading.value = false
      }
    }

    const getMetropolitanRegionColorMap = (metropolitanRegions: string[]) => {
      return metropolitanRegions.map((regionName, index) => {
        // schemeCategory10 holds only 10 colors but there are 83 regions
        // with remainder we get repeated colors.
        var remainder = index%10
        return {
          name: regionName,
          color: d3.schemeCategory10[remainder]
        }
      })
    }

    const getColor = (city: MetropolitanRegionsCities): string => {
      if(city.isMetropolitanRegion) {
        const color = metropolitanRegionColorMap.value.find(region => region.name===city.metropolitanRegionName)?.color?? ''
        return color
      }

      return 'rgb(0, 122, 97)';
    }
    
    const colorizePaths = (pathElementsMap: { [code: string] : Element | null; }) => {
      municipalitiesList.value.forEach(d => {
        const pathElement = pathElementsMap[d.cityId]
        if(pathElement) {
          pathElement.setAttribute("fill", getColor(d))
        }
      })
    }

    return {
      displayedFeatures,
      selectedCity,
      selectedMetropolitanRegion,
      isLoading,
      svgLoaded: () => console.log('svgLoaded'),
      svgLoadError: () => console.log('svgLoadError'),
      showFeatureDetails: () => console.log('showFeatureDetails'),
      cityClick: (code: string) => {
        if(selectedCity.value == code) {
          selectedCity.value = ''
          return
        }
        selectedCity.value = code;
      },
      pathMapLoaded: (pathMap: { [code: string] : Element | null; }) => {
        loadData().then(() => colorizePaths(pathMap))
      },
    }
  }
});
</script>

<style>
.metropolitan-regions {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 750px;
  margin: auto;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: relative;
}

.metropolitan-regions__container {
  background-color: #e0e0f0;
  padding: 14px 10px;
  position: relative;
}

.metropolitan-regions__labels {
  background-color: transparent;
  box-sizing: border-box;
  position: absolute;
  right: 0;
  top: 0;
  width: 180px;
  padding: 20px 10px 2px 2px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.metropolitan-regions__label {
  font-weight: 700;
  font-size: small;
  display: flex;
  align-items: center;
  align-self: end;
  gap: 8px;
  background-color: #e0e0f0;
  cursor: pointer;
}

.metropolitan-regions__label:hover .metropolitan-regions--hover,
.metropolitan-regions__label:hover .metropolitan-regions--hover {
  opacity: 0.6 !important;
}

.metropolitan-regions__label__box {
  border: 1px solid black;
  width: 15px;
  height: 15px;
  display: inline-block;
}

.blink {
  animation: blinker 6s linear infinite;
}

@keyframes blinker {
  0% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  95% {
    opacity: 0.4;
  }
}

.metropolitan-regions__map {
  height: 500px;
}

.metropolitan-regions-details__option {
  border: 1px solid black;
  padding: 4px;
}

.metropolitan-regions-details__graph {
  min-height: 800px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metropolitan-regions-details__loading, .metropolitan-regions__loading {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(200, 200, 200, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>