<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
import { getPieChartConfig } from '@/utils/chartConfig'

Chart.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  data: number[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function renderChart() {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()

  const config = getPieChartConfig(props.labels, props.data)
  chartInstance = new Chart(canvasRef.value, config)
}

onMounted(renderChart)

watch(
  () => [props.labels, props.data],
  () => renderChart(),
  { deep: true },
)

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<template>
  <div class="chart-container" data-testid="pie-chart">
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
