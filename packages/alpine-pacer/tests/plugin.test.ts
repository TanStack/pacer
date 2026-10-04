import { expect, it, vi } from 'vitest'
import Alpine from 'alpinejs'
import { pacerPlugin } from '../src'
it('owns magic-created callbacks until the Alpine element is destroyed', async () => {
  vi.useFakeTimers()
  Alpine.plugin(pacerPlugin)
  const element = document.createElement('div')
  element.setAttribute('x-data', '{ calls: [], callback: null }')
  element.setAttribute(
    'x-init',
    'callback = $pacer.createDebouncedCallback(value => calls.push(value), { wait: 10 })',
  )
  document.body.append(element)
  Alpine.initTree(element)
  try {
    Alpine.evaluate(element, 'callback("committed")')
    await vi.advanceTimersByTimeAsync(10)
    const calls = Alpine.evaluate(element, 'calls') as Array<string>
    expect(calls).toEqual(['committed'])
    Alpine.evaluate(element, 'callback("discarded")')
    Alpine.destroyTree(element)
    await vi.runAllTimersAsync()
    expect(calls).toEqual(['committed'])
  } finally {
    Alpine.destroyTree(element)
    element.remove()
    vi.useRealTimers()
  }
})
