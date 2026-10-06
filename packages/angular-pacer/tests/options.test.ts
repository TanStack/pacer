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
  injectThrottledValue(source, () => ({ wait: 100 }))
  injectRateLimitedValue(source, () => ({ limit: 1, window: 100 }))
  injectQueuedValue(source, () => ({ wait: 100 }))
  expectTypeOf(injectQueuedValue(source)()).toEqualTypeOf<string>()
  injectQueuedValue(signal({ label: 'source' }), {})
  injectQueuedValue(
    signal(() => 'source'),
    {},
  )
  // @ts-expect-error Value helpers use the source as their initial value, as sibling adapters do.
  injectThrottledValue(source, 'initial', { wait: 100 })
  // @ts-expect-error A queued value uses the same source/options/selector shape.
  injectQueuedValue(source, 'initial', {})

  const batcher = injectBatcher((_items: Array<string>) => {}, { wait: 100 })
  expectTypeOf(batcher.options().getShouldExecute).toEqualTypeOf<
    Batcher<string>['options']['getShouldExecute']
  >()
  const asyncBatcher = injectAsyncBatcher(async (_items: Array<string>) => {}, {
    wait: 100,
  })
  expectTypeOf(asyncBatcher.options().asyncRetryerOptions).toEqualTypeOf<
    AsyncBatcher<string>['options']['asyncRetryerOptions']
  >()
}

it('supports the documented options overloads', () => {
  expectTypeOf(checkOptionOverloads).toBeFunction()
})
