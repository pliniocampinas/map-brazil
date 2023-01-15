<template>
  <div class="asset-charts">
    <h4 class="asset-charts__header">Gráficos</h4>

    <div class="asset-charts__chart-container">
      <h5 class="asset-charts__chart-title">Nro. de ativos</h5>
      <canvas id="asset-count-chart"></canvas>
      <h5 class="asset-charts__chart-title">Metros²</h5>
      <canvas id="square-meter-chart"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import Asset from "@/interfaces/Asset";
import ArrowButton from '@/components/ArrowButton.vue';
import { defineComponent, PropType, Ref, ref } from "vue";
import { Chart, ChartItem, registerables } from 'chart.js';

export default defineComponent({
  name: 'AssetCharts',

  components: {
    ArrowButton,
  },

  props: {
    assets: {
      type: Array as PropType<Array<Asset>>,
      default: () => []
    },
  },

  setup(props, { emit }) {
    Chart.register(...registerables)
    const assetsCountChart = ref<Chart>()

    const drawChart = (chartRef: Ref<Chart>, featureLabel: string, 
      canvasId: string, charData: number[], color: string) => {
      if(chartRef.value) {
        chartRef.value.destroy()
      }

      const ctx = document.getElementById(canvasId)
      chartRef.value = new Chart(ctx as ChartItem, {
        type: 'bar',
        data: {
          labels: ['Média Nacional', featureLabel],
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
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    return {
      assetsCountChart,
    }
  }
});
</script>

<style scoped>

</style>