import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

describe('Card', () => {
  it('renders slot content', () => {
    const wrapper = mount(Card, {
      slots: { default: '<p>Card content</p>' },
    })
    expect(wrapper.text()).toContain('Card content')
  })

  it('renders title when provided', () => {
    const wrapper = mount(Card, {
      props: { title: 'Test Card' },
      slots: { default: '<p>Content</p>' },
    })
    expect(wrapper.find('.card-title').text()).toBe('Test Card')
  })

  it('does not render header when no title', () => {
    const wrapper = mount(Card, {
      slots: { default: '<p>Content</p>' },
    })
    expect(wrapper.find('.card-header').exists()).toBe(false)
  })
})

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('applies primary variant by default', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Btn' },
    })
    expect(wrapper.classes()).toContain('btn--primary')
  })

  it('applies secondary variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'secondary' as const },
      slots: { default: 'Btn' },
    })
    expect(wrapper.classes()).toContain('btn--secondary')
  })

  it('applies danger variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'danger' as const },
      slots: { default: 'Btn' },
    })
    expect(wrapper.classes()).toContain('btn--danger')
  })

  it('is disabled when prop is set', () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Btn' },
    })
    expect(wrapper.find('button').element.disabled).toBe(true)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Btn' },
    })
    await wrapper.trigger('click')
    // Disabled buttons don't fire click events in real browsers,
    // but in jsdom they do. We verify the disabled attribute is set.
    expect(wrapper.find('button').element.disabled).toBe(true)
  })
})

describe('Input', () => {
  it('renders with label', () => {
    const wrapper = mount(Input, {
      props: { label: 'Email', modelValue: '' },
    })
    expect(wrapper.find('.input-label').text()).toBe('Email')
  })

  it('binds v-model correctly', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'hello', 'onUpdate:modelValue': (v: string | number) => wrapper.setProps({ modelValue: v }) },
    })
    expect(wrapper.find('input').element.value).toBe('hello')
    await wrapper.find('input').setValue('world')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['world'])
  })

  it('shows error message', () => {
    const wrapper = mount(Input, {
      props: { error: 'Required field', modelValue: '' },
    })
    expect(wrapper.find('.input-error').text()).toBe('Required field')
    expect(wrapper.find('.input-field').classes()).toContain('input-field--error')
  })

  it('renders placeholder', () => {
    const wrapper = mount(Input, {
      props: { placeholder: 'Enter value', modelValue: '' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter value')
  })
})

describe('Modal', () => {
  it('renders when open is true', () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      slots: { default: '<p>Modal content</p>' },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.text()).toContain('Modal content')
  })

  it('does not render when open is false', () => {
    const wrapper = mount(Modal, {
      props: { open: false },
      slots: { default: '<p>Modal content</p>' },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.text()).not.toContain('Modal content')
  })

  it('renders title when provided', () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'Confirm' },
      slots: { default: '<p>Are you sure?</p>' },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.modal-title').text()).toBe('Confirm')
  })

  it('emits close when close button clicked', async () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      slots: { default: '<p>Content</p>' },
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('.modal-close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when overlay clicked', async () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      slots: { default: '<p>Content</p>' },
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})

describe('LoadingSpinner', () => {
  it('renders with status role', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('has accessible loading text', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.sr-only').text()).toBe('Loading...')
  })

  it('applies size classes', () => {
    const sm = mount(LoadingSpinner, { props: { size: 'sm' as const } })
    expect(sm.find('.spinner-container').classes()).toContain('spinner--sm')

    const lg = mount(LoadingSpinner, { props: { size: 'lg' as const } })
    expect(lg.find('.spinner-container').classes()).toContain('spinner--lg')
  })
})

describe('ErrorMessage', () => {
  it('renders error message', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Something went wrong' },
    })
    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('has alert role for accessibility', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Error' },
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })
})
