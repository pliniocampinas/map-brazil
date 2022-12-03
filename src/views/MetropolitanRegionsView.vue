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
      <h1 class="metropolitan-regions-details__heading">Detalhes {{ selectedFeatureLabel }}</h1>
      <template v-if="selectedFeatureLabel">
        <div class="metropolitan-regions-details__graph" >
          <div class="metropolitan-regions-details__loading" v-if="isDetailsLoading">
            <LoadingBars/>
          </div>
          <div v-if="selectedFeatureStats && !isDetailsLoading">
            <h3 class="metropolitan-regions-details__option">PIB per Capita</h3>
            <canvas id="gdp-per-capita-chart"></canvas>
          </div>
          <div v-if="selectedFeatureStats && !isDetailsLoading">
            <h3 class="metropolitan-regions-details__option">% Crescimento PIB</h3>
            <canvas id="gdp-growth-chart"></canvas>
          </div>
          <div v-if="selectedFeatureStats && !isDetailsLoading">
            <h3 class="metropolitan-regions-details__option">% Crescimento Populacional.</h3>
            <canvas id="pop-growth-chart"></canvas>
          </div>
        </div>
      </template>
      <div v-else>
        ---
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, Ref, ref } from 'vue';
import { Chart, ChartItem, registerables } from 'chart.js';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';
import LoadingBars from '@/components/LoadingBars.vue';
import { fetchData } from '@/services/GetCityGeographicFeaturesService';
// import { fetchData as fetchStatsData } from '@/services/GetGeographicFeatureStatsService';
import CityGeographicFeatures from '@/interfaces/CityGeographicFeatures';
import { sleep } from '@/utils/timeHelper';
import GeographicFeatureStats from '@/interfaces/GeographicFeatureStats';

export default defineComponent({
  name: 'MetropolitanRegionsView',

  components: {
    BrazilMunicipalitiesMap,
    LoadingBars,
  },

  setup() {
    // const displayedFeatures = [
    //   {
    //     label: 'MATOPIBA',
    //     key: 'matopiba',
    //     color: 'rgb(180, 180, 180)',
    //   },
    //   {
    //     label: 'Amazônia Legal',
    //     key: 'legal-amazon',
    //     color: 'rgb(50, 172, 50)',
    //   },
    //   {
    //     label: 'Semi-árido',
    //     color: 'rgb(252, 172, 99)',
    //     key: 'semi-arid',
    //   },
    //   {
    //     label: 'Defrontante ao mar',
    //     key: 'sea-front',
    //     color: 'rgb(50, 50, 180)',
    //   },
    //   {
    //     label: 'Outros',
    //     key: 'others',
    //     color: 'rgb(0, 122, 97)',
    //   },
    // ]
    const selectedCity = ref('')
    const selectedFeature = ref('')
    const isLoading = ref(false)
    const isDetailsLoading = ref(false)
    const municipalitiesList = ref<CityGeographicFeatures[]>([])
    const selectedFeatureStats = ref<GeographicFeatureStats>()
    Chart.register(...registerables)
    const gdpPerCapitaChart = ref<Chart>()
    const gdpGrowthChart = ref<Chart>()
    const popGrowthChart = ref<Chart>()

    const loadData = async () => {
      isLoading.value = true
      await sleep(500)
      try {
        const data = await fetchData()
        municipalitiesList.value = data
        isLoading.value = false
      } catch(err) {
        isLoading.value = false
      }
    }

    const getFeatureColor = (city: CityGeographicFeatures): string => {
      if(city.isSeaFront) {
        return 'rgb(50, 50, 180)'
      }

      if(city.isMatopiba) {
        return 'rgb(180, 180, 180)'
      }

      if(city.isSemiArid) {
        return 'rgb(252, 172, 99)'
      }

      if(city.isLegalAmazon) {
        return 'rgb(50, 172, 50)'
      }

      return 'rgb(0, 122, 97)';
    }
    
    const colorizePaths = (pathElementsMap: { [code: string] : Element | null; }) => {
      municipalitiesList.value.forEach(d => {
        const pathElement = pathElementsMap[d.cityId]
        if(pathElement) {
          pathElement.setAttribute("fill", getFeatureColor(d))
        }
      })
    }

    // const drawChart = (chartRef: Ref<Chart>, featureLabel: string, dataLabel: string, 
    //   canvasId: string, charData: number[], color: string) => {
    //   if(chartRef.value) {
    //     chartRef.value.destroy()
    //   }

    //   const ctx = document.getElementById(canvasId)
    //   chartRef.value = new Chart(ctx as ChartItem, {
    //     type: 'bar',
    //     data: {
    //       labels: ['Média Nacional', featureLabel],
    //       datasets: [{
    //         backgroundColor: color,
    //         data: [
    //           ...charData
    //         ],
    //         borderWidth: 1
    //       }]
    //     },
    //     options: {
    //       plugins: {
    //         legend: {
    //           display: false
    //         },
    //       },
    //       scales: {
    //         y: {
    //           beginAtZero: true
    //         }
    //       }
    //     }
    //   });
    // }

    // const showFeatureDetails = async (key: string) => {
    //   if(selectedFeature.value === key) {
    //     selectedFeature.value = ''
    //     return
    //   }
    //   selectedFeature.value = key
    //   // Scroll
    //   await nextTick()
    //   document.querySelector('.metropolitan-regions-details__heading')?.scrollIntoView({
    //     block: 'start',
    //     behavior: 'smooth'
    //   });
    //   // Load
    //   isDetailsLoading.value = true
    //   await sleep(500)
    //   selectedFeatureStats.value = await fetchStatsData(selectedFeature.value)
    //   isDetailsLoading.value = false
    //   await nextTick()
    //   // Render
      
    //   drawChart(gdpPerCapitaChart as Ref<Chart>, selectedFeatureLabel.value, 
    //     'Pib per Capita', 'gdp-per-capita-chart', 
    //     [selectedFeatureStats.value?.nationalGdpPerCapitaBrlAverage??0, 
    //       selectedFeatureStats.value?.featureGdpPerCapitaBrlAverage??0], 'red')
    //   drawChart(gdpGrowthChart as Ref<Chart>, selectedFeatureLabel.value, 
    //     'Crescimendo PIB', 'gdp-growth-chart', 
    //     [selectedFeatureStats.value?.nationalTotalGdpBrlGrowthPercentAverage??0, 
    //       selectedFeatureStats.value?.featureTotalGdpBrlGrowthPercentAverage??0], 'green')
    //   drawChart(popGrowthChart as Ref<Chart>, selectedFeatureLabel.value, 
    //     'Crescimento Pop', 'pop-growth-chart', 
    //     [selectedFeatureStats.value?.nationalPopulationGrowthPercentAverage??0, 
    //       selectedFeatureStats.value?.featurePopulationGrowthPercentAverage??0], 'blue')
    // }

    // const selectedFeatureLabel = computed(() => {
    //   return displayedFeatures.find(f => f.key===selectedFeature.value)?.label??''
    // })

    return {
      // displayedFeatures,
      selectedCity,
      selectedFeature,
      // selectedFeatureLabel,
      selectedFeatureStats,
      isLoading,
      isDetailsLoading,
      svgLoaded: () => console.log('svgLoaded'),
      svgLoadError: () => console.log('svgLoadError'),
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
      // showFeatureDetails,
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