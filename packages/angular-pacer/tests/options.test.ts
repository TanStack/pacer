import { expectTypeOf, it } from 'vitest'
import { signal } from '@angular/core'
import { injectDebouncedValue } from '../src/debouncer/injectDebouncedValue'
import { injectRateLimitedValue } from '../src/rate-limiter/injectRateLimitedValue'
import { injectThrottledValue } from '../src/throttler/injectThrottledValue'
import { injectQueuedValue } from '../src/queuer/injectQueuedValue'

function checkOptionOverloads() {
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
}

it('supports the documented options overloads', () => {
  expectTypeOf(checkOptionOverloads).toBeFunction()
})
