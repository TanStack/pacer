import { describe, expect, it } from 'vitest'
import { AsyncQueuer } from '../../pacer/src/async-queuer'
import { reductionFromState } from '../src/utils/reduction-from-state'

describe('reductionFromState', () => {
  it('reports no reduction when every queued item completes', async () => {
    const queuer = new AsyncQueuer((item: number) => Promise.resolve(item), {
      started: false,
    })
    queuer.addItem(1)
    await queuer.execute()
    expect(queuer.store.state.settleCount).toBe(1)
    expect(
      reductionFromState({ type: 'AsyncQueuer' }, queuer.store.state),
    ).toBe(0)
  })

  it('supports the queue completion counter in older Pacer releases', () => {
    expect(
      reductionFromState(
        { type: 'AsyncQueuer' },
        { addItemCount: 4, settledCount: 3 },
      ),
    ).toBe(25)
  })

  it('prefers the canonical counter even when it is zero', () => {
    expect(
      reductionFromState(
        { type: 'AsyncQueuer' },
        { addItemCount: 4, settleCount: 0, settledCount: 3 },
      ),
    ).toBe(100)
  })

  it.each([
    ['Debouncer', { maybeExecuteCount: 4, executionCount: 1 }, 75],
    ['AsyncDebouncer', { maybeExecuteCount: 4, settleCount: 1 }, 75],
    ['Batcher', { totalItemsProcessed: 10, executionCount: 2 }, 80],
    ['AsyncBatcher', { totalItemsProcessed: 10, settleCount: 2 }, 80],
    ['AsyncQueuer', { addItemCount: 0, settleCount: 0 }, 0],
  ])('preserves %s reduction calculations', (type, state, expected) => {
    expect(reductionFromState({ type }, state)).toBe(expected)
  })
})
