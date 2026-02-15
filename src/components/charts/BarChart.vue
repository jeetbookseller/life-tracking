<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { getBarChartConfig, type DatasetInput } from '@/utils/chartConfig'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  datasets: DatasetInput[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function renderChart() {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()

  const config = getBarChartConfig(props.labels, props.datasets)
  chartInstance = new Chart(canvasRef.value, config)
}

onMounted(renderChart)

watch(
  () => [props.labels, props.datasets],
  () => renderChart(),
  { deep: true },
)

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<template>
  <div class="chart-container" data-testid="bar-chart">
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 250px;
}
</style>
