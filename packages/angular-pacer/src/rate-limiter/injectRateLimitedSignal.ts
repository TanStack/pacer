import { signal } from '@angular/core'
import { injectRateLimiter } from './injectRateLimiter'
import type { Signal } from '@angular/core'
import type { AngularPacerOptions } from '../types'
import type {
  AngularRateLimiter,
  AngularRateLimiterOptions,
} from './injectRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'

type Setter<T> = (value: T | ((prev: T) => T)) => void

export type RateLimitedSignal<TValue, TSelected = {}> = Signal<TValue> & {
  set: Setter<TValue>
  rateLimiter: AngularRateLimiter<Setter<TValue>, TSelected>
}

/**
 * An Angular function that creates a rate-limited state signal, combining Angular's signal with rate limiting functionality.
 * This function provides both the current rate-limited value and methods to update it.
 *
 * Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
 * subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
 * or intelligently collapse updates.
 *
 * The function returns a callable object:
 * - `rateLimited()`: Get the current rate-limited value
 * - `rateLimited.set(...)`: Set or update the rate-limited value (rate-limited via maybeExecute)
 * - `rateLimited.rateLimiter`: The rate limiter instance with additional control methods and state signals
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
 * const rateLimited = injectRateLimitedSignal(0, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding'
 * });
 *
 * // Opt-in to reactive updates when limit state changes
 * const rateLimited = injectRateLimitedSignal(
 *   0,
 *   { limit: 5, window: 60000 },
 *   (state) => ({ rejectionCount: state.rejectionCount })
 * );
 * ```
 */
export function injectRateLimitedSignal<TValue, TSelected>(
  value: TValue,
  initialOptions: AngularPacerOptions<
    AngularRateLimiterOptions<Setter<NoInfer<TValue>>, NoInfer<TSelected>>
  >,
  selector: (state: RateLimiterState) => TSelected,
): RateLimitedSignal<TValue, TSelected>
export function injectRateLimitedSignal<TValue>(
  value: TValue,
  initialOptions: AngularPacerOptions<
    AngularRateLimiterOptions<Setter<NoInfer<TValue>>, {}>
  >,
  selector?: undefined,
): RateLimitedSignal<TValue, {}>
export function injectRateLimitedSignal<TValue, TSelected = {}>(
  value: TValue,
  initialOptions: AngularPacerOptions<
    AngularRateLimiterOptions<Setter<NoInfer<TValue>>, NoInfer<TSelected> | {}>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): RateLimitedSignal<TValue, TSelected | {}>
export function injectRateLimitedSignal<TValue, TSelected = {}>(
  value: TValue,
  initialOptions: AngularPacerOptions<
    AngularRateLimiterOptions<Setter<NoInfer<TValue>>, NoInfer<TSelected> | {}>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): RateLimitedSignal<TValue, TSelected | {}> {
  const rateLimitedValue = signal<TValue>(value)

  const rateLimiter = injectRateLimiter(
    (newValue: TValue | ((prev: TValue) => TValue)) => {
      if (typeof newValue === 'function') {
        rateLimitedValue.update(newValue as (prev: TValue) => TValue)
      } else {
        rateLimitedValue.set(newValue)
      }
    },
    initialOptions,
    selector,
  )

  const set: Setter<TValue> = (
    newValue: TValue | ((prev: TValue) => TValue),
  ) => {
    rateLimiter.maybeExecute(newValue)
  }

  const rateLimited = Object.assign(rateLimitedValue.asReadonly(), {
    set,
    rateLimiter,
  })

  return rateLimited
}
