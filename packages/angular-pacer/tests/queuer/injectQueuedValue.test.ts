import { isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectQueuedValue } from '../../src/queuer/injectQueuedValue'

it('returns a scalar Angular signal and queues initial and observed source values in order', () => {
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedValue(source, { started: false }, (state) => ({
      size: state.size,
    })),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<string>()
  expectTypeOf(value.queuer.state()).toEqualTypeOf<Readonly<{ size: number }>>()
  expect(value()).toBe('initial')
  TestBed.tick()
  source.set('first')
  TestBed.tick()
  source.set('second')
  TestBed.tick()
  expect(value()).toBe('initial')
  expect(value.queuer.peekAllItems()).toEqual(['initial', 'first', 'second'])
  expect(value.queuer.state()).toEqual({ size: 3 })
  value.queuer.execute()
  value.queuer.execute()
  expect(value()).toBe('first')
  value.queuer.execute()
  expect(value()).toBe('second')
})

it('processes queued source changes at the configured interval after resuming', () => {
  vi.useFakeTimers()
  const source = signal(0)
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedValue(source, { started: false, wait: 100 }),
  )
  TestBed.tick()
  source.set(1)
  TestBed.tick()
  source.set(2)
  TestBed.tick()
  value.queuer.start()
  expect(value()).toBe(0)
  vi.advanceTimersByTime(99)
  expect(value()).toBe(0)
  vi.advanceTimersByTime(1)
  expect(value()).toBe(1)
  vi.advanceTimersByTime(100)
  expect(value()).toBe(2)
})

it('observes accessor results and coalesces source writes before the effect runs', () => {
  const source = signal(1)
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedValue(() => source() * 2, { started: false }),
  )
  TestBed.tick()
  source.set(2)
  source.set(3)
  TestBed.tick()
  expect(value.queuer.peekAllItems()).toEqual([2, 6])
  value.queuer.flush()
  expect(value()).toBe(6)
})

it('applies explicitly enqueued values without changing the source', () => {
  const source = signal('source')
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedValue(source, { started: false }),
  )
  TestBed.tick()
  value.queuer.clear()
  value.queuer.addItem('manual')
  value.queuer.execute()
  expect(value()).toBe('manual')
  expect(source()).toBe('source')
  expect(value.queuer.state()).toEqual({})
})
