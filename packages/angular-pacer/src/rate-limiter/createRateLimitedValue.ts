import { effect, Signal } from '@angular/core'
import { createRateLimitedSignal } from './createRateLimitedSignal'
import type { AngularRateLimiter } from './createRateLimiter'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

type Setter<T> = (value: T | ((prev: T) => T)) => void

/**
 * An Angular function that creates a rate-limited value that updates at most a certain number of times within a time window.
 * Unlike createRateLimitedSignal, this function automatically tracks changes to the input signal
 * and updates the rate-limited value accordingly.
 *
 * The rate-limited value will update according to the configured rate limit, blocking updates
 * once the limit is reached until the window resets.
 *
 * The function returns a tuple containing:
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
 * const value = signal(0);
 * const [rateLimitedValue, rateLimiter] = createRateLimitedValue(value, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding'
 * });
 *
 * // rateLimitedValue will update at most 5 times per 60 seconds
 * effect(() => {
 *   updateUI(rateLimitedValue());
 * });
 * ```
 */
export function createRateLimitedValue<TValue, TSelected = {}>(
  value: Signal<TValue>,
  initialOptions: RateLimiterOptions<Setter<TValue>>,
  selector?: (state: RateLimiterState) => TSelected,
): [Signal<TValue>, AngularRateLimiter<Setter<TValue>, TSelected>] {
  const [rateLimitedValue, setRateLimitedValue, rateLimiter] =
    createRateLimitedSignal(value(), initialOptions, selector)

  effect(() => {
    setRateLimitedValue(value())
  })

  return [rateLimitedValue, rateLimiter]
}

