import { afterEach, expect, it, vi } from 'vitest'
import { createRoot, flushSync, drainPassiveEffects } from 'octane'
import { Fixture, capture } from './Helpers.tsrx'
let dispose = () => {}
afterEach(() => {
  dispose()
  capture.calls = []
  vi.useRealTimers()
})
it('composes compiled callback, state, value, and queue helpers with independent slots', async () => {
  vi.useFakeTimers()
  const target = document.createElement('div')
  document.body.append(target)
  const root = createRoot(target)
  dispose = () => {
    root.unmount()
    target.remove()
  }
  flushSync(() => root.render(Fixture))
  drainPassiveEffects()
  const click = (id: string) => {
    flushSync(() => target.querySelector<HTMLButtonElement>(`#${id}`)!.click())
    drainPassiveEffects()
  }
  click('callback')
  click('state')
  click('source')
  click('queue')
  expect(target.querySelector('#items')!.textContent).toBe('1')
  await vi.advanceTimersByTimeAsync(20)
  flushSync(() => {})
  drainPassiveEffects()
  expect(capture.calls).toEqual(['last'])
  expect(target.querySelector('#value')!.textContent).toBe('3')
  expect(target.querySelector('#derived')!.textContent).toBe('second')
  click('start')
  await vi.runAllTimersAsync()
  flushSync(() => {})
  expect(capture.calls).toEqual(['last', 'queued'])
  expect(target.querySelector('#items')!.textContent).toBe('0')
  click('callback')
  root.unmount()
  await vi.runAllTimersAsync()
  expect(capture.calls).toEqual(['last', 'queued'])
})
