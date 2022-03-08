<template>
  <div class="boxplot__municipalities">
    <div class="boxplot__municipalities__container">
      <div class="map__loading" v-if="isLoading">
        <LoadingBars/>
      </div>
    </div>
    <div class="boxplot__municipalities__chart" ref="chartContainerElement">
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, onMounted } from 'vue';
import { fetchData } from '@/utils/municipalityMapHelper';
import { BoxPlot } from '@/utils/boxPlotHelper';
import { formatCurrencyBrl } from '@/utils/formatters';
import MunicipalitiesData from '@/interfaces/MunicipalitiesData';
import LoadingBars from '@/components/LoadingBars.vue';

export default defineComponent({
  name: 'BrazilMunicipalitiesBoxPlotView',

  components: {
    LoadingBars,
  },

  setup() {
    const sleep = async (ms: number) => await new Promise(resolve => setTimeout(resolve, ms));

    const chartContainerElement = ref(null as HTMLElement | null)
    const isLoading = ref(false)
    const municipalitiesList = ref<MunicipalitiesData[]>([])
    
    const drawBoxPlot = () => {
      const chart = BoxPlot(municipalitiesList.value, {
        // x: (d: MunicipalitiesData) => d.state,
        y: (d: MunicipalitiesData) => d.gdpPerCapitaBrl,
        xLabel: "Carats →",
        yLabel: "↑ Price ($)",
        width: 500,
        height: 500
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

    onBeforeMount(async () => {
      await loadData()
    })

    onMounted(async () => {
      await drawBoxPlot()
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
  grid-template-columns: 1fr 200px;
  max-width: 750px;
  margin: auto;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: relative;
}

.boxplot__municipalities__container {
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

.boxplot__municipalities__details {
  padding: 24px;
  text-align: left;
  background-color: #e3e3e3;
}

.boxplot__municipalities__details p {
  font-size: 12px;
}
</style>