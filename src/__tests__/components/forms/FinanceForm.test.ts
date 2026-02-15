import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FinanceForm from '@/components/forms/FinanceForm.vue'

function mountForm(props = {}) {
  return mount(FinanceForm, { props })
}

describe('FinanceForm', () => {
  it('renders all required fields', () => {
    const wrapper = mountForm()
    expect(wrapper.find('[data-testid="finance-form"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Total Assets')
    expect(wrapper.text()).toContain('Total Liabilities')
    expect(wrapper.text()).toContain('Net Worth')
    expect(wrapper.text()).toContain('Date')
  })

  it('defaults date to today', () => {
    const wrapper = mountForm()
    const today = new Date().toISOString().split('T')[0]
    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.element.value).toBe(today)
  })

  it('auto-calculates net worth from assets minus liabilities', async () => {
    const wrapper = mountForm()
    const numberInputs = wrapper.findAll('.input-field[type="number"]')
    await numberInputs[0].setValue(100000) // totalAssets
    await numberInputs[1].setValue(30000) // totalLiabilities

    // Net worth should be displayed as calculated
    const netWorthDisplay = wrapper.find('[data-testid="net-worth-display"]')
    expect(netWorthDisplay.text()).toContain('70,000')
  })

  it('emits save event with correct data shape on valid submission', async () => {
    const wrapper = mountForm()
    const numberInputs = wrapper.findAll('.input-field[type="number"]')
    await numberInputs[0].setValue(50000)
    await numberInputs[1].setValue(10000)

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    const data = emitted![0][0] as Record<string, unknown>
    expect(data).toHaveProperty('totalAssets')
    expect(data).toHaveProperty('totalLiabilities')
    expect(data).toHaveProperty('netWorth')
    expect(data).toHaveProperty('categorySpending')
  })

  it('supports adding spending categories', async () => {
    const wrapper = mountForm()
    const catName = wrapper.find('[data-testid="category-name"]')
    const catAmount = wrapper.find('[data-testid="category-amount"]')

    await catName.setValue('Groceries')
    await catAmount.setValue(500)

    const addBtn = wrapper.findAll('button').find((b) => b.text() === 'Add')
    await addBtn!.trigger('click')

    expect(wrapper.text()).toContain('Groceries')
    expect(wrapper.text()).toContain('500')
  })

  it('supports removing spending categories', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        totalAssets: 100000,
        totalLiabilities: 50000,
        netWorth: 50000,
        categorySpending: { Rent: 2000 },
      },
    })

    expect(wrapper.text()).toContain('Rent')
    const removeBtn = wrapper.find('.remove-btn')
    await removeBtn.trigger('click')
    expect(wrapper.text()).not.toContain('Rent')
  })

  it('populates form with initial data for edit mode', () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-06-01',
        totalAssets: 200000,
        totalLiabilities: 80000,
        netWorth: 120000,
        categorySpending: { Food: 600 },
      },
    })
    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.element.value).toBe('2025-06-01')
    expect(wrapper.text()).toContain('Food')
  })

  it('emits cancel event', async () => {
    const wrapper = mountForm()
    const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')
    await cancelBtn!.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
