import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MetricCard from '@/components/metrics/MetricCard.vue'
import DeltaIndicator from '@/components/metrics/DeltaIndicator.vue'
import StreakCounter from '@/components/metrics/StreakCounter.vue'

describe('MetricCard', () => {
  it('displays label, value, and unit', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Resting HR',
        value: 62,
        unit: 'bpm',
      },
    })
    expect(wrapper.text()).toContain('Resting HR')
    expect(wrapper.text()).toContain('62')
    expect(wrapper.text()).toContain('bpm')
  })

  it('renders with data-testid', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Focus',
        value: 4.2,
      },
    })
    expect(wrapper.find('[data-testid="metric-card"]').exists()).toBe(true)
  })

  it('displays value without unit when unit not provided', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Score',
        value: 85,
      },
    })
    expect(wrapper.text()).toContain('85')
    expect(wrapper.text()).toContain('Score')
  })

  it('displays icon when provided', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Health',
        value: 72,
        icon: 'heart',
      },
    })
    expect(wrapper.find('[data-testid="metric-icon"]').exists()).toBe(true)
  })

  it('handles zero value', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Tasks',
        value: 0,
      },
    })
    expect(wrapper.text()).toContain('0')
  })

  it('handles null/undefined value gracefully', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Empty',
        value: null as unknown as number,
      },
    })
    expect(wrapper.text()).toContain('--')
  })
})

describe('DeltaIndicator', () => {
  it('shows positive change with up arrow and green styling', () => {
    const wrapper = mount(DeltaIndicator, {
      props: { value: 15 },
    })
    expect(wrapper.text()).toContain('15%')
    expect(wrapper.find('.delta--positive').exists()).toBe(true)
  })

  it('shows negative change with down arrow and red styling', () => {
    const wrapper = mount(DeltaIndicator, {
      props: { value: -8 },
    })
    expect(wrapper.text()).toContain('8%')
    expect(wrapper.find('.delta--negative').exists()).toBe(true)
  })

  it('shows zero change as neutral', () => {
    const wrapper = mount(DeltaIndicator, {
      props: { value: 0 },
    })
    expect(wrapper.find('.delta--neutral').exists()).toBe(true)
  })

  it('renders with data-testid', () => {
    const wrapper = mount(DeltaIndicator, {
      props: { value: 5 },
    })
    expect(wrapper.find('[data-testid="delta-indicator"]').exists()).toBe(true)
  })

  it('supports inverted mode where negative is good', () => {
    const wrapper = mount(DeltaIndicator, {
      props: { value: -10, inverted: true },
    })
    // In inverted mode, negative is styled as positive (green)
    expect(wrapper.find('.delta--positive').exists()).toBe(true)
  })
})

describe('StreakCounter', () => {
  it('displays current streak count', () => {
    const wrapper = mount(StreakCounter, {
      props: { count: 12, label: 'Meditation' },
    })
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('Meditation')
  })

  it('renders with data-testid', () => {
    const wrapper = mount(StreakCounter, {
      props: { count: 5, label: 'Reading' },
    })
    expect(wrapper.find('[data-testid="streak-counter"]').exists()).toBe(true)
  })

  it('shows "days" unit text', () => {
    const wrapper = mount(StreakCounter, {
      props: { count: 3, label: 'Exercise' },
    })
    expect(wrapper.text()).toContain('days')
  })

  it('handles zero streak', () => {
    const wrapper = mount(StreakCounter, {
      props: { count: 0, label: 'Meditation' },
    })
    expect(wrapper.text()).toContain('0')
  })
})
