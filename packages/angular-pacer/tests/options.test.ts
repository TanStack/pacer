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
  expectTypeOf(injectQueuedValue(source)()).toEqualTypeOf<string>()
  const objectSource = signal({ label: 'source' })
  const objectInitial = { label: 'fallback' }
  const functionInitial = () => 'fallback'
  const functionSource = signal(() => 'source')
  injectQueuedValue(objectSource, objectInitial, {})
  injectQueuedValue(objectSource, objectInitial, undefined, undefined)
  injectQueuedValue(
    objectSource,
    objectInitial,
    () => ({ wait: 100 }),
    undefined,
  )
  injectQueuedValue(functionSource, functionInitial, {})
  injectQueuedValue(functionSource, functionInitial, undefined, undefined)
  injectQueuedValue(source, 'fallback')
  injectQueuedValue(source, 'fallback', undefined)
  injectQueuedValue(source, { wait: 100 }, undefined)
  // @ts-expect-error Object fallbacks require explicit options to distinguish them from options-only calls.
  injectQueuedValue(objectSource, objectInitial)
  // @ts-expect-error Undefined third arguments are reserved for options plus an undefined selector.
  injectQueuedValue(objectSource, objectInitial, undefined)
  // @ts-expect-error Function fallbacks require explicit options to distinguish them from factories.
  injectQueuedValue(functionSource, functionInitial)
  // @ts-expect-error Undefined options for a function fallback require a fourth argument.
  injectQueuedValue(functionSource, functionInitial, undefined)
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
