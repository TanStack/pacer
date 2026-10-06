import { effect, linkedSignal, untracked } from '@angular/core'
import { injectRateLimiter } from './injectRateLimiter'
import type { AngularPacerOptions } from '../types'
import type { RateLimitedSignal } from './injectRateLimitedSignal'
import type { AngularRateLimiterOptions } from './injectRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'

type Setter<T> = (value: T | ((previous: T) => T)) => void

/**
 * An Angular function that creates a rate-limited value that updates at most a certain number of times within a time window.
 * Unlike injectRateLimitedSignal, this function automatically tracks changes to the input signal
 * and updates the rate-limited value accordingly.
 *
 * The rate-limited value will update according to the configured rate limit, blocking updates
 * once the limit is reached until the window resets.
 *
 * The function returns a rate-limited signal object containing:
 * - A Signal that provides the current rate-limited value
 * - The rate limiter instance with control methods
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for reactive state management via the underlying rate limiter instance.
 * The `selector` parameter allows you to specify which rate limiter state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.
 *
 * By default, the selected state is an empty object. Provide a selector to expose
 * reactive state fields. The adapter observes core work separately for Angular stability.
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const value = signal(0)
 * const rateLimited = injectRateLimitedValue(value, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding',
 * })
 *
 * // rateLimited() will update at most 5 times per 60 seconds
 * effect(() => {
 *   updateUI(rateLimited())
 * })
 * ```
 */
export function injectRateLimitedValue<TValue, TSelected>(
  value: () => TValue,
  options: AngularPacerOptions<
    AngularRateLimiterOptions<Setter<TValue>, TSelected>
  >,
  selector: (state: RateLimiterState) => TSelected,
): RateLimitedSignal<TValue, TSelected>
export function injectRateLimitedValue<TValue>(
  value: () => TValue,
  options: AngularPacerOptions<AngularRateLimiterOptions<Setter<TValue>, {}>>,
  selector?: undefined,
): RateLimitedSignal<TValue, {}>
export function injectRateLimitedValue<TValue, TSelected = {}>(
  value: () => TValue,
  options: AngularPacerOptions<
    AngularRateLimiterOptions<Setter<TValue>, TSelected | {}>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): RateLimitedSignal<TValue, TSelected | {}>
export function injectRateLimitedValue<TValue, TSelected = {}>(
  value: () => TValue,
  options: AngularPacerOptions<
    AngularRateLimiterOptions<Setter<TValue>, TSelected | {}>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): RateLimitedSignal<TValue, TSelected | {}> {
  // Initialize from the source once, lazily, after required inputs can be bound.
  const currentValue = linkedSignal<TValue, TValue>({
    source: value,
    computation: (initial, previous) => (previous ? previous.value : initial),
  })
  const rateLimiter = injectRateLimiter(
    (next: TValue | ((previous: TValue) => TValue)) => {
      if (typeof next === 'function')
        currentValue.update(next as (previous: TValue) => TValue)
      else currentValue.set(next)
    },
    options,
    selector,
  )

  effect(() => {
    const latest = value()
    untracked(() => rateLimiter.maybeExecute(() => latest))
  })

  return Object.assign(currentValue.asReadonly(), {
    set: (next: TValue | ((previous: TValue) => TValue)) =>
      rateLimiter.maybeExecute(next),
    rateLimiter,
  })
}
