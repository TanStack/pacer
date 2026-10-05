import { expect, it, vi } from 'vitest'
import { createDebouncer } from '../src'
import { setup, flush } from './setup'

it('subscribes a child host without owning or cancelling its parent utility', async () => {
  const parent = setup((host) =>
    createDebouncer(host, () => {}, { wait: 1000 }),
  )
  const utility = parent.result
  const child = setup((host) =>
    utility.subscribe(host, (state) => ({ pending: state.isPending })),
  )
  try {
    await flush()
    const requestUpdate = vi.spyOn(child.host, 'requestUpdate')
    utility.maybeExecute()
    await flush()
    expect(child.result()).toEqual({ pending: true })
    expect(utility.state).toEqual({})
    requestUpdate.mockClear()
    utility.maybeExecute()
    await flush()
    expect(requestUpdate).not.toHaveBeenCalled()
    child.destroy()
    expect(utility.store.state.isPending).toBe(true)
    utility.cancel()
    expect(requestUpdate).not.toHaveBeenCalled()
    document.body.append(child.host)
    await child.host.updateComplete
    expect(child.result()).toEqual({ pending: false })
  } finally {
    child.destroy()
    parent.destroy()
  }
})
