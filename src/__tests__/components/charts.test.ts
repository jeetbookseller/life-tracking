import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

// Mock Chart.js - canvas rendering doesn't work in jsdom
vi.mock('chart.js', () => {
  class MockChart {
    static register = vi.fn()
    destroy = vi.fn()
    update = vi.fn()
    data: unknown
    options: unknown
    constructor(_ctx: unknown, config: { data: unknown; options: unknown }) {
      this.data = config.data
      this.options = config.options
    }
  }
  return {
    Chart: MockChart,
    registerables: [],
    CategoryScale: class {},
    LinearScale: class {},
    PointElement: class {},
    LineElement: class {},
    BarElement: class {},
    ArcElement: class {},
    Tooltip: class {},
    Legend: class {},
    Filler: class {},
    Title: class {},
  }
})

describe('LineChart', () => {
  it('renders a canvas element', () => {
    const wrapper = mount(LineChart, {
      props: {
        labels: ['Mon', 'Tue', 'Wed'],
        datasets: [{ label: 'Focus', data: [3, 4, 5] }],
      },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('renders with data-testid', () => {
    const wrapper = mount(LineChart, {
      props: {
        labels: ['Mon', 'Tue'],
        datasets: [{ label: 'HR', data: [60, 62] }],
      },
    })
    expect(wrapper.find('[data-testid="line-chart"]').exists()).toBe(true)
  })

  it('renders container div for responsiveness', () => {
    const wrapper = mount(LineChart, {
      props: {
        labels: ['A'],
        datasets: [{ label: 'X', data: [1] }],
      },
    })
    expect(wrapper.find('.chart-container').exists()).toBe(true)
  })

  it('handles empty data without crashing', () => {
    const wrapper = mount(LineChart, {
      props: {
        labels: [],
        datasets: [],
      },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})

describe('BarChart', () => {
  it('renders a canvas element', () => {
    const wrapper = mount(BarChart, {
      props: {
        labels: ['Jan', 'Feb'],
        datasets: [{ label: 'Tasks', data: [10, 15] }],
      },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('renders with data-testid', () => {
    const wrapper = mount(BarChart, {
      props: {
        labels: ['A'],
        datasets: [{ label: 'X', data: [1] }],
      },
    })
    expect(wrapper.find('[data-testid="bar-chart"]').exists()).toBe(true)
  })

  it('handles empty data without crashing', () => {
    const wrapper = mount(BarChart, {
      props: {
        labels: [],
        datasets: [],
      },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})

describe('PieChart', () => {
  it('renders a canvas element', () => {
    const wrapper = mount(PieChart, {
      props: {
        labels: ['Food', 'Transport'],
        data: [500, 200],
      },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('renders with data-testid', () => {
    const wrapper = mount(PieChart, {
      props: {
        labels: ['A', 'B'],
        data: [1, 2],
      },
    })
    expect(wrapper.find('[data-testid="pie-chart"]').exists()).toBe(true)
  })

  it('handles empty data without crashing', () => {
    const wrapper = mount(PieChart, {
      props: {
        labels: [],
        data: [],
      },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})
