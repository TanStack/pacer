import { expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { PacerProvider, useDebouncer } from '../src'
import type { VueDebouncer } from '../src'

it('updates inherited defaults while preserving local overrides and utility identity', async () => {
  const wait = ref(false)
  let inherited!: VueDebouncer<() => void>
  let local!: VueDebouncer<() => void>
  const Child = defineComponent({
    setup() {
      inherited = useDebouncer(() => {}, { wait: 100 })
      local = useDebouncer(() => {}, { wait: 25, enabled: false })
      return () => null
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          PacerProvider,
          { defaultOptions: { debouncer: { enabled: wait.value } } },
          { default: () => h(Child) },
        ),
    }),
  )
  const original = inherited
  expect(inherited.options.enabled).toBe(false)
  wait.value = true
  await nextTick()
  expect(inherited).toBe(original)
  expect(inherited.options.enabled).toBe(true)
  expect(local.options.enabled).toBe(false)
  wrapper.unmount()
})

it('rejects an unowned composable before resolving options or creating a utility', () => {
  const options = vi.fn(() => ({ wait: 100 }))
  expect(() => useDebouncer(() => {}, options)).toThrow(
    'active Vue effect scope',
  )
  expect(options).not.toHaveBeenCalled()
})
