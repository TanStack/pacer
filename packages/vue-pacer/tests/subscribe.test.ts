import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { expect, it, vi } from 'vitest'
import { useDebouncer } from '../src'

it('subscribes in a child without subscribing its owner to state', async () => {
  const renderSelection = vi.fn()
  let utility!: ReturnType<typeof useDebouncer<() => void>>
  const visible = ref(true)
  const wrapper = mount(
    defineComponent({
      setup() {
        utility = useDebouncer(() => {}, { wait: 1000 })
        return () =>
          visible.value
            ? h(
                utility.Subscribe,
                {
                  selector: (state) => ({ pending: state.isPending }),
                },
                {
                  default: (state: { pending: boolean }) => {
                    renderSelection(state)
                    return h('output', String(state.pending))
                  },
                },
              )
            : null
      },
    }),
  )
  expect(wrapper.text()).toBe('false')
  utility.maybeExecute()
  await nextTick()
  expect(wrapper.text()).toBe('true')
  expect(utility.state.value).toEqual({})
  const renders = renderSelection.mock.calls.length
  utility.maybeExecute()
  await nextTick()
  expect(renderSelection).toHaveBeenCalledTimes(renders)
  visible.value = false
  await nextTick()
  utility.cancel()
  await nextTick()
  expect(renderSelection).toHaveBeenCalledTimes(renders)
  wrapper.unmount()
})
