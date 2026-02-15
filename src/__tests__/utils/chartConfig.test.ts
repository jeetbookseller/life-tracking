import { describe, it, expect } from 'vitest'
import {
  getLineChartConfig,
  getBarChartConfig,
  getPieChartConfig,
  CHART_COLORS,
  formatDateLabel,
  type TimeRange,
  getDateRangeFromPreset,
} from '@/utils/chartConfig'

describe('CHART_COLORS', () => {
  it('exports an array of color strings', () => {
    expect(Array.isArray(CHART_COLORS)).toBe(true)
    expect(CHART_COLORS.length).toBeGreaterThan(0)
    CHART_COLORS.forEach((color) => {
      expect(typeof color).toBe('string')
    })
  })
})

describe('getLineChartConfig', () => {
  it('returns a valid Chart.js config object', () => {
    const config = getLineChartConfig(
      ['Mon', 'Tue', 'Wed'],
      [{ label: 'Focus', data: [3, 4, 5] }],
    )
    expect(config.type).toBe('line')
    expect(config.data.labels).toEqual(['Mon', 'Tue', 'Wed'])
    expect(config.data.datasets).toHaveLength(1)
    expect(config.data.datasets[0].label).toBe('Focus')
    expect(config.data.datasets[0].data).toEqual([3, 4, 5])
  })

  it('supports multiple datasets', () => {
    const config = getLineChartConfig(
      ['A', 'B'],
      [
        { label: 'HR', data: [60, 62] },
        { label: 'HRV', data: [40, 45] },
      ],
    )
    expect(config.data.datasets).toHaveLength(2)
  })

  it('sets responsive to true', () => {
    const config = getLineChartConfig(['A'], [{ label: 'X', data: [1] }])
    expect(config.options?.responsive).toBe(true)
  })
})

describe('getBarChartConfig', () => {
  it('returns a valid bar chart config', () => {
    const config = getBarChartConfig(
      ['Jan', 'Feb'],
      [{ label: 'Tasks', data: [10, 15] }],
    )
    expect(config.type).toBe('bar')
    expect(config.data.labels).toEqual(['Jan', 'Feb'])
    expect(config.data.datasets[0].data).toEqual([10, 15])
  })

  it('sets responsive to true', () => {
    const config = getBarChartConfig(['A'], [{ label: 'X', data: [1] }])
    expect(config.options?.responsive).toBe(true)
  })
})

describe('getPieChartConfig', () => {
  it('returns a valid pie chart config', () => {
    const config = getPieChartConfig(
      ['Food', 'Transport', 'Rent'],
      [500, 200, 1000],
    )
    expect(config.type).toBe('pie')
    expect(config.data.labels).toEqual(['Food', 'Transport', 'Rent'])
    expect(config.data.datasets[0].data).toEqual([500, 200, 1000])
  })

  it('assigns background colors', () => {
    const config = getPieChartConfig(['A', 'B'], [1, 2])
    expect(config.data.datasets[0].backgroundColor).toBeDefined()
    expect(
      (config.data.datasets[0].backgroundColor as string[]).length,
    ).toBeGreaterThanOrEqual(2)
  })
})

describe('formatDateLabel', () => {
  it('formats ISO date to readable short label', () => {
    const label = formatDateLabel('2025-01-15')
    expect(typeof label).toBe('string')
    expect(label.length).toBeGreaterThan(0)
  })

  it('handles different dates consistently', () => {
    const label1 = formatDateLabel('2025-06-01')
    const label2 = formatDateLabel('2025-12-31')
    expect(label1).not.toBe(label2)
  })
})

describe('getDateRangeFromPreset', () => {
  it('returns start and end dates for "7d" preset', () => {
    const range = getDateRangeFromPreset('7d')
    expect(range.startDate).toBeDefined()
    expect(range.endDate).toBeDefined()
    const start = new Date(range.startDate)
    const end = new Date(range.endDate)
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(6)
  })

  it('returns 30-day range for "30d"', () => {
    const range = getDateRangeFromPreset('30d')
    const start = new Date(range.startDate)
    const end = new Date(range.endDate)
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(29)
  })

  it('returns 90-day range for "90d"', () => {
    const range = getDateRangeFromPreset('90d')
    const start = new Date(range.startDate)
    const end = new Date(range.endDate)
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(89)
  })

  it('returns a wide range for "all"', () => {
    const range = getDateRangeFromPreset('all')
    expect(range.startDate).toBeDefined()
    expect(range.endDate).toBeDefined()
    expect(range.startDate < range.endDate).toBe(true)
  })
})
