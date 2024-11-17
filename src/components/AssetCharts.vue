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
import AssetsPerState from "@/interfaces/AssetsPerState";
import { defineComponent, PropType, Ref, ref, watch } from "vue";
import { Chart, ChartItem, registerables } from 'chart.js';

export default defineComponent({
  name: 'AssetCharts',

  props: {
    states: {
      type: Array as PropType<Array<AssetsPerState>>,
      default: () => []
    },
  },

  setup(props) {
    Chart.register(...registerables)
    const assetsCountChart = ref<Chart>()
    const squareMetersChart = ref<Chart>()

    watch(() => props.states, () => {
      drawAssetsCountChart(props.states)
      drawSquareMetersChart(props.states)
    })

    const drawAssetsCountChart = (states: Array<AssetsPerState>) => {
      const charData = states.map(r => ({
          label: r.stateAcronym,
          value: r.assetsCount
        })).sort((r1, r2) => r1.value > r2.value? -1: 1)
        .slice(0, 5)

      drawChart(
        assetsCountChart as Ref<Chart>,
        0,
        charData.map(r => r.label), 
        charData.map(r => r.value), 
        'asset-count-chart',
        'red'
      )
    }

    const drawSquareMetersChart = (states: Array<AssetsPerState>) => {
      const charData = states.map(r => ({
          label: r.stateAcronym,
          value: r.totalSquareMeters
        })).sort((r1, r2) => r1.value > r2.value? -1: 1)
        .slice(0, 5)

      drawChart(
        squareMetersChart as Ref<Chart>,
        0,
        charData.map(r => r.label), 
        charData.map(r => r.value), 
        'square-meter-chart',
        'blue'
      )
    }

    const drawChart = (
        chartRef: Ref<Chart>, 
        nationalAverage: number,
        labels: string[], 
        charData: number[], 
        canvasId: string,  
        color: string
      ) => {
      if(chartRef.value) {
        chartRef.value.destroy()
      }

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
              display: nationalAverage? true: false,
              labels: {
                color: 'black',
                boxHeight: 1,
                boxWidth: 20,
                generateLabels: () => [{
                  text: 'Média Nacional'
                }]
              }
            },
            annotation: {
              annotations: nationalAverage? [
                {
                  type: 'line',
                  scaleID: 'x',
                  value: nationalAverage,
                }
              ]: []
            }
          },
          indexAxis: 'y',
          scales: {
            y: {
              beginAtZero: true
            }
          },
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
.asset-charts {
  color: var(--app-tertiary-color);
}
</style>