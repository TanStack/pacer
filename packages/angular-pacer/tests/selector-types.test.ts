import './helpers/angular'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it } from 'vitest'
import { injectRateLimitedSignal } from '../src/rate-limiter/injectRateLimitedSignal'
import { injectDebouncer } from '../src/debouncer/injectDebouncer'
import { injectThrottledValue } from '../src/throttler/injectThrottledValue'
import { injectQueuedSignal } from '../src/queuer/injectQueuedSignal'
import { injectAsyncQueuedSignal } from '../src/async-queuer/injectAsyncQueuedSignal'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'

it('does not promise caller-selected fields when the selector is omitted', () => {
  TestBed.runInInjectionContext(() => {
    const utility = injectDebouncer<() => void, { ready: string }>(() => {}, {
      wait: 1,
    })
    expect(utility.state()).toEqual({})
    // @ts-expect-error An omitted selector cannot produce ready.
    utility.state().ready
    const value = injectThrottledValue<string, { ready: string }>(() => '', {
      wait: 1,
    })
    // @ts-expect-error The value helper must preserve the same honest selection type.
    value.throttler.state().ready
    const queued = injectQueuedSignal<
      string,
      Pick<QueuerState<string>, 'items'> & { ready: string }
    >(() => {}, { started: false })
    expect(queued.queuer.state()).toEqual({ items: [] })
    // @ts-expect-error The default queue selector produces only items.
    queued.queuer.state().ready
    const asyncQueued = injectAsyncQueuedSignal<
      string,
      Pick<AsyncQueuerState<string>, 'items'> & { ready: string }
    >(async () => {}, { started: false })
    // @ts-expect-error The async queue has the same default selection contract.
    asyncQueued.queuer.state().ready
  })
})

it('distinguishes definite selectors from optional selectors', () => {
  TestBed.runInInjectionContext(() => {
    const selected = injectDebouncer(
      () => {},
      { wait: 1 },
      (state) => ({ ready: state.isPending }),
    )
    expectTypeOf(selected.state()).toEqualTypeOf<Readonly<{ ready: boolean }>>()
    function checkOptional(
      selector?: (state: DebouncerState<() => void>) => { ready: boolean },
    ) {
      const forwarded = injectDebouncer(() => {}, { wait: 1 }, selector)
      expectTypeOf(forwarded.state()).toEqualTypeOf<
        Readonly<{} | { ready: boolean }>
      >()
      // @ts-expect-error A possibly absent selector cannot guarantee ready.
      forwarded.state().ready
    }
    checkOptional()
  })
})

it('widens editable managed values when reactive options include core callbacks', () => {
  TestBed.runInInjectionContext(() => {
    const controlled = injectRateLimitedSignal(
      0,
      () => ({
        limit: 1,
        window: 1000,
        onReject: (limiter) => {
          limiter.getMsUntilNextWindow()
        },
      }),
      (state) => state,
    )
    controlled.set(42)
    expectTypeOf(controlled()).toEqualTypeOf<number>()
    expectTypeOf(
      controlled.rateLimiter.state().executionCount,
    ).toEqualTypeOf<number>()
  })
})
