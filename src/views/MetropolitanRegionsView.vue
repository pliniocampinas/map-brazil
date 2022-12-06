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
          Clique em uma região metropolitana para ver detalhes
          </span>
        </div>
      </div>
    </div>
    <div class="metropolitan-regions-details__container">
      <h1 class="metropolitan-regions-details__heading">Detalhes</h1>
      <h3 class="metropolitan-regions-details__heading">{{ selectedMetropolitanRegion }}</h3>
      <div class="metropolitan-regions-details__graph" >
        <div class="metropolitan-regions-details__loading" v-if="isDetailsLoading">
          <LoadingBars/>
        </div>
        <div v-if="!isDetailsLoading">
          <h3 class="metropolitan-regions-details__option">PIB per Capita</h3>
          <canvas id="gdp-per-capita-chart"></canvas>
        </div>
        <div v-if="!isDetailsLoading">
          <h3 class="metropolitan-regions-details__option">% Crescimento PIB</h3>
          <canvas id="gdp-growth-chart"></canvas>
        </div>
        <div v-if="!isDetailsLoading">
          <h3 class="metropolitan-regions-details__option">% Crescimento Populacional.</h3>
          <canvas id="pop-growth-chart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import { defineComponent, nextTick, Ref, ref } from 'vue';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';
import LoadingBars from '@/components/LoadingBars.vue';
import { fetchData } from '@/services/GetMetropolitanRegionsCities';
import { fetchData as fetchDetails } from '@/services/GetMetropolitanRegionsDetailsService';
import { sleep } from '@/utils/timeHelper';
import MetropolitanRegionsCities from '@/interfaces/MetropolitanRegionsCities';
import MetropolitanRegionsDetails from "@/interfaces/MetropolitanRegionsDetails";
import { Chart, ChartItem, registerables } from "chart.js";
import ChartAnnotationsPlugin from 'chartjs-plugin-annotation';

export default defineComponent({
  name: 'MetropolitanRegionsView',

  components: {
    BrazilMunicipalitiesMap,
    LoadingBars,
  },

  setup() {
    const selectedCity = ref('')
    const selectedMetropolitanRegion = ref('')
    const isLoading = ref(false)
    const isDetailsLoading = ref(false)
    const municipalitiesList = ref<MetropolitanRegionsCities[]>([])
    const metropolitanRegionsDetails = ref<MetropolitanRegionsDetails>()
    const uniqueMetropolitanRegions = ref<string[]>([])
    const metropolitanRegionColorMap = ref<{color: string, name: string}[]>([])
    Chart.register(...registerables)
    Chart.register(ChartAnnotationsPlugin);
    const gdpPerCapitaChart = ref<Chart>()
    const gdpGrowthChart = ref<Chart>()
    const popGrowthChart = ref<Chart>()
    
    const loadData = async () => {
      isLoading.value = true
      await sleep(500)
      try {
        const data = await fetchData()
        const uniqueMetropolitanRegionsSet = new Set<string>()
        for (const city of data) {
          uniqueMetropolitanRegionsSet.add(city.metropolitanRegionName)
        }
        uniqueMetropolitanRegions.value = Array.from(uniqueMetropolitanRegionsSet)
        metropolitanRegionColorMap.value = getMetropolitanRegionColorMap(uniqueMetropolitanRegions.value)
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

    const drawChart = (chartRef: Ref<Chart>, labels: string[], 
      canvasId: string, charData: number[], color: string) => {
      if(chartRef.value) {
        chartRef.value.destroy()
      }

      console.log('charData', charData)

      const ctx = document.getElementById(canvasId)
      chartRef.value = new Chart(ctx as ChartItem, {
        type: 'bar',
        data: {
          labels: [...labels],
          datasets: [{
            backgroundColor: color,
            data: [
              ...charData
            ],
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false
            },
            // annotation: {
            //   annotations: [
            //     {
            //       type: 'line',
            //       scaleID: 'y-0',
            //       value: 20,
            //       label: {
            //         content: 'My Horizontal Line',
            //       }
            //     }
            //   ]
            // }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          },
        }
      });
    }
    
    const loadDetails = async () => {
      // Load
      isDetailsLoading.value = true
      await sleep(500)
      metropolitanRegionsDetails.value = await fetchDetails()
      isDetailsLoading.value = false
      await nextTick()
      console.log('metropolitanRegionsDetails', metropolitanRegionsDetails.value.metropolitanRegions.length)
      // Render

      console.log('metropolitanRegionsDetails', metropolitanRegionsDetails.value.metropolitanRegions.slice(1,10))
      
      drawChart(gdpPerCapitaChart as Ref<Chart>, 
        metropolitanRegionsDetails.value.metropolitanRegions.slice(1,10).map(r => r.metropolitanRegionName), 
        'gdp-per-capita-chart', 
        metropolitanRegionsDetails.value.metropolitanRegions.slice(1,10).map(r => r.gdpPerCapitaBrlAverage), 
        'red')
      // drawChart(gdpGrowthChart as Ref<Chart>, selectedFeatureLabel.value, 
      //   'Crescimendo PIB', 'gdp-growth-chart', 
      //   [selectedFeatureStats.value?.nationalTotalGdpBrlGrowthPercentAverage??0, 
      //     selectedFeatureStats.value?.featureTotalGdpBrlGrowthPercentAverage??0], 'green')
      // drawChart(popGrowthChart as Ref<Chart>, selectedFeatureLabel.value, 
      //   'Crescimento Pop', 'pop-growth-chart', 
      //   [selectedFeatureStats.value?.nationalPopulationGrowthPercentAverage??0, 
      //     selectedFeatureStats.value?.featurePopulationGrowthPercentAverage??0], 'blue')
    }

    return {
      selectedCity,
      selectedMetropolitanRegion,
      isLoading,
      isDetailsLoading,
      svgLoaded: () => console.log('svgLoaded'),
      svgLoadError: () => console.log('svgLoadError'),
      showFeatureDetails: () => console.log('showFeatureDetails'),
      cityClick: (code: string) => {
        if(selectedCity.value == code) {
          selectedCity.value = ''
          selectedMetropolitanRegion.value = ''
          return
        }
        selectedCity.value = code;

        const city = municipalitiesList.value.find(m => m.cityId+''===code)
        if(!city) {
          console.warn('city not found, something terrible happened')
        }
        selectedMetropolitanRegion.value = city?.metropolitanRegionName??''
      },
      pathMapLoaded: (pathMap: { [code: string] : Element | null; }) => {
        loadData()
          .then(() => colorizePaths(pathMap))
          .then(loadDetails)
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
  background-color: rgba(200, 200, 200, 0.4);
  border: 1px solid rgb(200, 200, 200);
  cursor: pointer;
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

.metropolitan-regions-details__option {
  border: 1px solid black;
  padding: 4px;
}
</style>