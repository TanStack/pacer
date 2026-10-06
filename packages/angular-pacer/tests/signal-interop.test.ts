import './helpers/angular'
import { isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it } from 'vitest'
import { injectDebouncedSignal } from '../src/debouncer/injectDebouncedSignal'
import { injectThrottledSignal } from '../src/throttler/injectThrottledSignal'
import { injectRateLimitedSignal } from '../src/rate-limiter/injectRateLimitedSignal'
import { injectQueuedSignal } from '../src/queuer/injectQueuedSignal'
import { injectAsyncQueuedSignal } from '../src/async-queuer/injectAsyncQueuedSignal'
import { injectThrottledValue } from '../src/throttler/injectThrottledValue'
import type { Signal } from '@angular/core'

it('returns genuine Angular signals from every managed signal helper', () => {
  const values = TestBed.runInInjectionContext(() => [
    injectDebouncedSignal('', { wait: 100 }),
    injectThrottledSignal('', { wait: 100 }),
    injectRateLimitedSignal('', { limit: 1, window: 100 }),
    injectQueuedSignal(() => {}, { started: false }),
    injectAsyncQueuedSignal(async () => {}, { started: false }),
  ])
  expect(values.map(isSignal)).toEqual([true, true, true, true, true])
})

it('exposes signal types that compose with other Pacer value helpers', () => {
  TestBed.runInInjectionContext(() => {
    const debounced = injectDebouncedSignal('', { wait: 100 })
    const throttled = injectThrottledSignal('', { wait: 100 })
    const limited = injectRateLimitedSignal('', { limit: 1, window: 100 })
    const queued = injectQueuedSignal((_item: string) => {}, { started: false })
    const asyncQueued = injectAsyncQueuedSignal(async (_item: string) => {}, {
      started: false,
    })
    expectTypeOf(debounced).toMatchTypeOf<Signal<string>>()
    expectTypeOf(throttled).toMatchTypeOf<Signal<string>>()
    expectTypeOf(limited).toMatchTypeOf<Signal<string>>()
    expectTypeOf(queued).toMatchTypeOf<Signal<Array<string>>>()
    expectTypeOf(asyncQueued).toMatchTypeOf<Signal<Array<string>>>()
    const derived = injectThrottledValue(debounced, { wait: 100 })
    derived.set('next')
    expectTypeOf(derived()).toEqualTypeOf<string>()
    expectTypeOf(signal('')).toMatchTypeOf<Signal<string>>()
  })
})
