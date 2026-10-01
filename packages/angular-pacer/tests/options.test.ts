import { expectTypeOf, it } from 'vitest'
import { signal } from '@angular/core'
import { injectDebouncedValue } from '../src/debouncer/injectDebouncedValue'
import { injectRateLimitedValue } from '../src/rate-limiter/injectRateLimitedValue'
import { injectThrottledValue } from '../src/throttler/injectThrottledValue'
import { injectQueuedValue } from '../src/queuer/injectQueuedValue'
import { injectBatcher } from '../src/batcher/injectBatcher'
import { injectAsyncBatcher } from '../src/async-batcher/injectAsyncBatcher'
import { providePacerOptions } from '../src/provider/pacer-provider'
import type { AngularDebouncer } from '../src/debouncer/injectDebouncer'
import type { Debouncer } from '@tanstack/pacer/debouncer'
import type { Batcher } from '@tanstack/pacer/batcher'
import type { AsyncBatcher } from '@tanstack/pacer/async-batcher'

function checkOptionOverloads() {
  providePacerOptions({
    asyncBatcher: { onUnmount: (utility) => utility.state() },
    asyncDebouncer: { onUnmount: (utility) => utility.state() },
    asyncQueuer: { onUnmount: (utility) => utility.state() },
    asyncRateLimiter: { onUnmount: (utility) => utility.state() },
    asyncThrottler: { onUnmount: (utility) => utility.state() },
    batcher: { onUnmount: (utility) => utility.state() },
    debouncer: {
      onUnmount: (utility) => {
        expectTypeOf(utility).toEqualTypeOf<AngularDebouncer<any, any>>()
      },
      onExecute: (_args, utility) => {
        expectTypeOf(utility).toEqualTypeOf<Debouncer<any>>()
      },
    },
    queuer: { onUnmount: (utility) => utility.state() },
    rateLimiter: { onUnmount: (utility) => utility.state() },
    throttler: { onUnmount: (utility) => utility.state() },
  })
  const source = signal('value')
  injectDebouncedValue(source, { wait: 100 })
  injectDebouncedValue(
    source,
    () => ({ wait: 100 }),
    (state) => state.isPending,
  )
  injectDebouncedValue(source, 'initial', { wait: 100 })
  injectDebouncedValue(source, 'initial', () => ({ wait: 100 }), undefined)
  injectThrottledValue(source, 'initial', () => ({ wait: 100 }), undefined)
  injectRateLimitedValue(
    source,
    'initial',
    () => ({ limit: 1, window: 100 }),
    undefined,
  )
  injectQueuedValue(source, 'initial', () => ({ wait: 100 }), undefined)
  // @ts-expect-error A fourth argument distinguishes a factory from a selector.
  injectDebouncedValue(source, 'initial', () => ({ wait: 100 }))
  // @ts-expect-error A fourth argument distinguishes a factory from a selector.
  injectThrottledValue(source, 'initial', () => ({ wait: 100 }))
  // @ts-expect-error A fourth argument distinguishes a factory from a selector.
  injectRateLimitedValue(source, 'initial', () => ({ limit: 1, window: 100 }))
  // @ts-expect-error A fourth argument distinguishes a factory from a selector.
  injectQueuedValue(source, 'initial', () => ({ wait: 100 }))

  const batcher = injectBatcher((_items: Array<string>) => {}, { wait: 100 })
  expectTypeOf(batcher.options.getShouldExecute).toEqualTypeOf<
    Batcher<string>['options']['getShouldExecute']
  >()
  const asyncBatcher = injectAsyncBatcher(async (_items: Array<string>) => {}, {
    wait: 100,
  })
  expectTypeOf(asyncBatcher.options.asyncRetryerOptions).toEqualTypeOf<
    AsyncBatcher<string>['options']['asyncRetryerOptions']
  >()
}

it('supports the documented options overloads', () => {
  expectTypeOf(checkOptionOverloads).toBeFunction()
})
