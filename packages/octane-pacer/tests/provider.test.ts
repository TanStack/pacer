import { expect, it } from 'vitest'
import { createRoot, flushSync, drainPassiveEffects } from 'octane'
import { Fixture, capture } from './Provider.tsrx'
it('applies changing provider defaults without replacing instances or local overrides', () => {
  const target = document.createElement('div')
  document.body.append(target)
  const root = createRoot(target)
  try {
    flushSync(() => root.render(Fixture))
    drainPassiveEffects()
    const original = capture.utility
    expect(original!.options.enabled).toBe(false)
    flushSync(() => target.querySelector('button')!.click())
    drainPassiveEffects()
    expect(capture.utility).toBe(original)
    expect(original!.options.enabled).toBe(true)
    expect(capture.local!.options.enabled).toBe(false)
  } finally {
    root.unmount()
    target.remove()
  }
})
