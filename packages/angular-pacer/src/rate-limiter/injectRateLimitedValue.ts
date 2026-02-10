import { effect } from '@angular/core'
import { injectRateLimitedSignal } from './injectRateLimitedSignal'
import type { RateLimitedSignal } from './injectRateLimitedSignal'
import type { Signal } from '@angular/core'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

type Setter<T> = (value: T | ((prev: T) => T)) => void

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
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary updates and gives you
 * full control over when your component tracks state changes.
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
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
export function injectRateLimitedValue<TValue, TSelected = {}>(
  value: Signal<TValue>,
  initialOptions: RateLimiterOptions<Setter<TValue>>,
  selector?: (state: RateLimiterState) => TSelected,
): RateLimitedSignal<TValue, TSelected>
export function injectRateLimitedValue<TValue, TSelected = {}>(
  value: Signal<TValue>,
  initialValue: TValue,
  initialOptions: RateLimiterOptions<Setter<TValue>>,
  selector?: (state: RateLimiterState) => TSelected,
): RateLimitedSignal<TValue, TSelected>
export function injectRateLimitedValue<TValue, TSelected = {}>(
  value: Signal<TValue>,
  initialValueOrOptions: TValue | RateLimiterOptions<Setter<TValue>>,
  initialOptionsOrSelector?:
    | RateLimiterOptions<Setter<TValue>>
    | ((state: RateLimiterState) => TSelected),
  maybeSelector?: (state: RateLimiterState) => TSelected,
): RateLimitedSignal<TValue, TSelected> {
  const hasSelector = typeof initialOptionsOrSelector === 'function'

  const hasInitialValue =
    (initialOptionsOrSelector !== undefined && !hasSelector) ||
    maybeSelector !== undefined

  const initialValue = hasInitialValue
    ? (initialValueOrOptions as TValue)
    : (undefined as unknown as TValue)
  const initialOptions = hasInitialValue
    ? (initialOptionsOrSelector as RateLimiterOptions<Setter<TValue>>)
    : (initialValueOrOptions as RateLimiterOptions<Setter<TValue>>)
  const selector = hasInitialValue
    ? maybeSelector
    : (initialOptionsOrSelector as
        | ((state: RateLimiterState) => TSelected)
        | undefined)

  const rateLimited = injectRateLimitedSignal(
    initialValue,
    initialOptions,
    selector,
  )

  effect(() => {
    const latest = value()
    rateLimited.set(latest)
  })

  return rateLimited
}
