import { afterEach, expect, it } from 'vitest'
import { createRoot, flushSync, drainPassiveEffects } from 'octane'
import { Fixture, capture } from './Throttler.tsrx'
let dispose = () => {}
afterEach(() => {
  dispose()
  capture.cleanups = []
})
it('isolates repeated compiled hooks and commits options without replacing instances', () => {
  const target = document.createElement('div')
  document.body.append(target)
  const root = createRoot(target)
  dispose = () => {
    root.unmount()
    target.remove()
  }
  flushSync(() => root.render(Fixture))
  drainPassiveEffects()
  const utility = capture.utility!,
    other = capture.other!
  expect(utility).not.toBe(other)
  const store = utility.store
  flushSync(() => target.querySelector('button')!.click())
  drainPassiveEffects()
  expect(capture.utility).toBe(utility)
  expect(utility.store).toBe(store)
  expect(utility.options).toMatchObject({ wait: 200 })
  flushSync(() =>
    utility.store.setState((state) => ({ ...state, executionCount: 4 })),
  )
  expect(target.querySelector('output')!.textContent).toBe('4')
  root.unmount()
  expect(capture.cleanups).toEqual([200])
})
