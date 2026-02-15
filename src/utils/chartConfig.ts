import type { ChartConfiguration } from 'chart.js'

export type TimeRange = '7d' | '30d' | '90d' | 'all'

export const CHART_COLORS = [
  '#6c63ff', // primary purple
  '#4caf50', // green
  '#ff9800', // orange
  '#f44336', // red
  '#2196f3', // blue
  '#9c27b0', // deep purple
  '#00bcd4', // cyan
  '#ff5722', // deep orange
  '#8bc34a', // light green
  '#e91e63', // pink
]

export const CHART_COLORS_ALPHA = CHART_COLORS.map((c) => c + '33')

export interface DatasetInput {
  label: string
  data: number[]
  color?: string
}

export function getLineChartConfig(
  labels: string[],
  datasets: DatasetInput[],
): ChartConfiguration<'line'> {
  return {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.color ?? CHART_COLORS[i % CHART_COLORS.length],
        backgroundColor:
          (ds.color ?? CHART_COLORS[i % CHART_COLORS.length]) + '33',
        borderWidth: 2,
        tension: 0.3,
        fill: datasets.length === 1,
        pointRadius: 3,
        pointHoverRadius: 5,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: datasets.length > 1,
          labels: { color: '#e4e4f0' },
        },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          ticks: { color: '#9a9ab0' },
          grid: { color: '#2d2d4a' },
        },
        y: {
          ticks: { color: '#9a9ab0' },
          grid: { color: '#2d2d4a' },
        },
      },
    },
  }
}

export function getBarChartConfig(
  labels: string[],
  datasets: DatasetInput[],
): ChartConfiguration<'bar'> {
  return {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor:
          ds.color ?? CHART_COLORS[i % CHART_COLORS.length] + '99',
        borderColor: ds.color ?? CHART_COLORS[i % CHART_COLORS.length],
        borderWidth: 1,
        borderRadius: 4,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: datasets.length > 1,
          labels: { color: '#e4e4f0' },
        },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          ticks: { color: '#9a9ab0' },
          grid: { color: '#2d2d4a' },
        },
        y: {
          ticks: { color: '#9a9ab0' },
          grid: { color: '#2d2d4a' },
          beginAtZero: true,
        },
      },
    },
  }
}

export function getPieChartConfig(
  labels: string[],
  data: number[],
): ChartConfiguration<'pie'> {
  return {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map(
            (_, i) => CHART_COLORS[i % CHART_COLORS.length],
          ),
          borderColor: '#1a1a2e',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#e4e4f0', padding: 12 },
        },
      },
    },
  }
}

export function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getDateRangeFromPreset(preset: TimeRange): {
  startDate: string
  endDate: string
} {
  const end = new Date()
  const endDate = end.toISOString().split('T')[0]!

  if (preset === 'all') {
    return { startDate: '2020-01-01', endDate }
  }

  const daysMap: Record<Exclude<TimeRange, 'all'>, number> = {
    '7d': 6,
    '30d': 29,
    '90d': 89,
  }

  const days = daysMap[preset]
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  const startDate = start.toISOString().split('T')[0]!

  return { startDate, endDate }
}
