import { createRoot, drainPassiveEffects, flushSync } from 'octane'
import { expect, it } from 'vitest'
import { Fixture, capture } from './Subscribe.tsrx'

it('owns child subscriptions without selecting state in the parent', () => {
  const target = document.createElement('div')
  document.body.append(target)
  const root = createRoot(target)
  const flush = (run = () => {}) => {
    flushSync(run)
    drainPassiveEffects()
  }
  try {
    flush(() => root.render(Fixture))
    const utility = capture.utility!
    expect(target.querySelector('output')?.textContent).toBe('false')
    flush(() => utility.maybeExecute())
    expect(target.querySelector('output')?.textContent).toBe('true')
    expect(utility.state).toEqual({})
    const renders = capture.renders
    flush(() => utility.maybeExecute())
    expect(capture.renders).toBe(renders)
    flush(() => target.querySelector('button')!.click())
    expect(target.querySelector('output')).toBeNull()
    expect(utility.store.state.isPending).toBe(true)
    flush(() => utility.cancel())
    expect(capture.renders).toBe(renders)
  } finally {
    root.unmount()
    target.remove()
    capture.renders = 0
  }
})
