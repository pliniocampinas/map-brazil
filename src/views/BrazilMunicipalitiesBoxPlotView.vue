<template>
  <div class="boxplot__municipalities">
    <div class="boxplot__municipalities__container">
      <div class="boxplot__loading" v-if="isLoading">
        <LoadingBars/>
      </div>
      <div class="boxplot__municipalities__chart" ref="chartContainerElement">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchData } from '@/repositories/MunicipalityRepository';
import { BoxPlot } from '@/utils/boxPlotHelper';
import MunicipalitiesData from '@/interfaces/MunicipalitiesData';
import LoadingBars from '@/components/LoadingBars.vue';

export default defineComponent({
  name: 'BrazilMunicipalitiesBoxPlotView',

  components: {
    LoadingBars,
  },

  setup() {
    const chartContainerElement = ref(null as HTMLElement | null)
    const isLoading = ref(false)
    const municipalitiesList = ref<MunicipalitiesData[]>([])
    
    const drawBoxPlot = () => {
      const chart = BoxPlot(municipalitiesList.value, {
        x: (d: MunicipalitiesData) => d.year,
        y: (d: MunicipalitiesData) => Math.round(d.gdpPerCapitaBrl / 100) * 100,
        yLabel: "Gdp Per Capita ($)",
        xLabel: "Year",
        width: 500,
        height: 700,
      })

      chartContainerElement.value?.appendChild(chart as Node)
    }

    const loadData = async () => {
      isLoading.value = true
      const data = await fetchData()
      isLoading.value = false
      municipalitiesList.value = data.map(municipality => {
        return {
          ...municipality,
        }
      })
    }

    onMounted(async () => {
      await loadData()
      drawBoxPlot()
    })

    return {
      isLoading,
      municipalitiesList,
      chartContainerElement,
    }
  }
});
</script>

<style>
.boxplot__municipalities {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 750px;
  margin: auto;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: relative;
}

.boxplot__municipalities__container {
  background-color: #f9f9f9;
}

.boxplot__loading {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(200, 200, 200, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.boxplot__municipality {
  stroke: #232323;
  stroke-width: 0;
  cursor: pointer;
}

.boxplot__municipality:hover,
.boxplot__municipality--selected {
  opacity: 0.7;
  stroke-width: 3;
  stroke: #cccccc;
}

.boxplot__municipalities__details {
  padding: 24px;
  text-align: left;
  background-color: #e3e3e3;
}

.boxplot__municipalities__details p {
  font-size: 12px;
}
</style>