import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ComparisonCard from '@/components/insights/ComparisonCard.vue'
import AnomalyAlert from '@/components/insights/AnomalyAlert.vue'
import GoalProgress from '@/components/insights/GoalProgress.vue'
import type { Anomaly } from '@/utils/trends'
import type { GoalWithProgress } from '@/stores/insights'

describe('ComparisonCard', () => {
  it('renders "this week" vs "last week" values', () => {
    const wrapper = mount(ComparisonCard, {
      props: {
        title: 'Productivity: This Week vs Last Week',
        thisWeek: { focusRating: 4.2, deepWorkHours: 14 },
        lastWeek: { focusRating: 3.5, deepWorkHours: 10 },
      },
    })

    expect(wrapper.find('[data-testid="comparison-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Productivity')
    expect(wrapper.text()).toContain('4.2')
    expect(wrapper.text()).toContain('3.5')
    expect(wrapper.text()).toContain('14')
    expect(wrapper.text()).toContain('10')
  })

  it('shows metric names', () => {
    const wrapper = mount(ComparisonCard, {
      props: {
        title: 'Health',
        thisWeek: { sleepDuration: 7.5 },
        lastWeek: { sleepDuration: 7 },
      },
    })
    expect(wrapper.text()).toContain('sleepDuration')
  })

  it('displays percentage change', () => {
    const wrapper = mount(ComparisonCard, {
      props: {
        title: 'Test',
        thisWeek: { metric: 120 },
        lastWeek: { metric: 100 },
      },
    })
    // 20% increase
    expect(wrapper.text()).toContain('20.0%')
  })

  it('shows positive styling for increase', () => {
    const wrapper = mount(ComparisonCard, {
      props: {
        title: 'Test',
        thisWeek: { metric: 150 },
        lastWeek: { metric: 100 },
      },
    })
    expect(wrapper.find('.delta--positive').exists()).toBe(true)
  })

  it('shows negative styling for decrease', () => {
    const wrapper = mount(ComparisonCard, {
      props: {
        title: 'Test',
        thisWeek: { metric: 80 },
        lastWeek: { metric: 100 },
      },
    })
    expect(wrapper.find('.delta--negative').exists()).toBe(true)
  })
})

describe('AnomalyAlert', () => {
  const sampleAnomalies: Anomaly[] = [
    {
      date: '2025-01-14',
      metric: 'Sleep Duration',
      value: 3.5,
      mean: 7.5,
      stdDev: 1,
      direction: 'low',
    },
    {
      date: '2025-01-16',
      metric: 'Resting HR',
      value: 95,
      mean: 62,
      stdDev: 5,
      direction: 'high',
    },
  ]

  it('renders when anomalies are present', () => {
    const wrapper = mount(AnomalyAlert, {
      props: { anomalies: sampleAnomalies },
    })
    expect(wrapper.find('[data-testid="anomaly-alert"]').exists()).toBe(true)
  })

  it('hides when no anomalies', () => {
    const wrapper = mount(AnomalyAlert, {
      props: { anomalies: [] },
    })
    expect(wrapper.find('[data-testid="anomaly-alert"]').exists()).toBe(false)
  })

  it('displays anomaly details', () => {
    const wrapper = mount(AnomalyAlert, {
      props: { anomalies: sampleAnomalies },
    })
    expect(wrapper.text()).toContain('Sleep Duration')
    expect(wrapper.text()).toContain('unusually low')
    expect(wrapper.text()).toContain('3.5')
    expect(wrapper.text()).toContain('Resting HR')
    expect(wrapper.text()).toContain('unusually high')
  })

  it('renders one list item per anomaly', () => {
    const wrapper = mount(AnomalyAlert, {
      props: { anomalies: sampleAnomalies },
    })
    const items = wrapper.findAll('.anomaly-alert__item')
    expect(items.length).toBe(2)
  })

  it('displays the title', () => {
    const wrapper = mount(AnomalyAlert, {
      props: { anomalies: sampleAnomalies },
    })
    expect(wrapper.text()).toContain('Anomalies Detected')
  })
})

describe('GoalProgress', () => {
  const sampleGoals: GoalWithProgress[] = [
    {
      domain: 'productivity',
      metric: 'deepWorkHours',
      target: 4,
      label: 'Daily deep work',
      current: 3,
      percentage: 75,
    },
    {
      domain: 'reading',
      metric: 'pagesRead',
      target: 30,
      label: 'Read 30 pages',
      current: 30,
      percentage: 100,
    },
  ]

  it('renders with data-testid', () => {
    const wrapper = mount(GoalProgress, {
      props: { goals: sampleGoals },
    })
    expect(wrapper.find('[data-testid="goal-progress"]').exists()).toBe(true)
  })

  it('shows correct percentage toward target', () => {
    const wrapper = mount(GoalProgress, {
      props: { goals: sampleGoals },
    })
    expect(wrapper.text()).toContain('75%')
    expect(wrapper.text()).toContain('100%')
  })

  it('displays goal labels', () => {
    const wrapper = mount(GoalProgress, {
      props: { goals: sampleGoals },
    })
    expect(wrapper.text()).toContain('Daily deep work')
    expect(wrapper.text()).toContain('Read 30 pages')
  })

  it('displays current / target values', () => {
    const wrapper = mount(GoalProgress, {
      props: { goals: sampleGoals },
    })
    expect(wrapper.text()).toContain('3.0 / 4')
    expect(wrapper.text()).toContain('30.0 / 30')
  })

  it('shows empty message when no goals', () => {
    const wrapper = mount(GoalProgress, {
      props: { goals: [] },
    })
    expect(wrapper.text()).toContain('No goals set')
  })

  it('applies complete styling for 100% goals', () => {
    const wrapper = mount(GoalProgress, {
      props: { goals: sampleGoals },
    })
    expect(
      wrapper.find('.goal-progress__bar-fill--complete').exists(),
    ).toBe(true)
  })
})
