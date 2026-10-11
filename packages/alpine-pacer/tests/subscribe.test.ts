import { expect, it, vi } from 'vitest'
import { createDebouncer } from '../src'
import { createScope } from '../src/provider/PacerProvider'

it('subscribes a child scope without owning or cancelling its parent utility', async () => {
  const parent = createScope()
  const child = createScope()
  const utility = createDebouncer(parent, () => {}, { wait: 1000 })
  const selected = utility.subscribe(child, (state) => ({
    pending: state.isPending,
  }))
  const render = vi.fn()
  child.effect(() => render(selected().pending))
  try {
    utility.maybeExecute()
    await Promise.resolve()
    expect(render).toHaveBeenLastCalledWith(true)
    expect(utility.state).toEqual({})
    const renders = render.mock.calls.length
    utility.maybeExecute()
    await Promise.resolve()
    expect(render).toHaveBeenCalledTimes(renders)
    child.destroy()
    expect(utility.store.state.isPending).toBe(true)
    utility.cancel()
    await Promise.resolve()
    expect(render).toHaveBeenCalledTimes(renders)
    expect(() => utility.subscribe(child, (state) => state)).toThrow(
      'destroyed Pacer scope',
    )
  } finally {
    child.destroy()
    parent.destroy()
  }
})
