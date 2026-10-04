import { expect, it } from 'vitest'
import { createRoot, flushSync, drainPassiveEffects } from 'octane'
import { Fixture, capture } from './Selection.tsrx'

it('refreshes a selection when component inputs change without a store update', () => {
  const target = document.createElement('div')
  document.body.append(target)
  const root = createRoot(target)
  try {
    flushSync(() => root.render(Fixture))
    drainPassiveEffects()
    const original = capture.utility!
    expect(target.querySelector('output')?.textContent).toBe('1')
    flushSync(() => target.querySelector('button')!.click())
    drainPassiveEffects()
    expect(capture.utility).toBe(original)
    expect(original.store.state.executionCount).toBe(0)
    expect(target.querySelector('output')?.textContent).toBe('2')
  } finally {
    root.unmount()
    target.remove()
  }
})
