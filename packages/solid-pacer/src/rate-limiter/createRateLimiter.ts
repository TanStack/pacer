import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import { useStore } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

export interface SolidRateLimiter<
  TFn extends AnyFunction,
  TSelected = RateLimiterState,
> extends Omit<RateLimiter<TFn>, 'store'> {
  /**
   * Reactive state that will be updated when the rate limiter state changes
   *
   * Use this instead of `rateLimiter.store.state`
   */
  state: Accessor<TSelected>
}

/**
 * A low-level Solid hook that creates a `RateLimiter` instance to enforce rate limits on function execution.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
 * you can integrate with any state management solution (createSignal, etc).
 *
 * Rate limiting is a simple "hard limit" approach that allows executions until a maximum count is reached within
 * a time window, then blocks all subsequent calls until the window resets. Unlike throttling or debouncing,
 * it does not attempt to space out or collapse executions intelligently.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * For smoother execution patterns:
 * - Use throttling when you want consistent spacing between executions (e.g. UI updates)
 * - Use debouncing when you want to collapse rapid-fire events (e.g. search input)
 * - Use rate limiting only when you need to enforce hard limits (e.g. API rate limits)
 *
 * @example
 * ```tsx
 * // Basic rate limiting - max 5 calls per minute with a sliding window
 * const rateLimiter = createRateLimiter(apiCall, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding',
 *   onReject: (rateLimiter) => {
 *     console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
 *   }
 * });
 *
 * // Access rate limiter state via signals
 * console.log('Executions:', rateLimiter.executionCount());
 * console.log('Rejections:', rateLimiter.rejectionCount());
 * console.log('Remaining:', rateLimiter.remainingInWindow());
 * console.log('Next window in:', rateLimiter.msUntilNextWindow());
 * ```
 */
export function createRateLimiter<
  TFn extends AnyFunction,
  TSelected = RateLimiterState,
>(
  fn: TFn,
  initialOptions: RateLimiterOptions<TFn>,
  selector?: (state: RateLimiterState) => TSelected,
): SolidRateLimiter<TFn, TSelected> {
  const rateLimiter = bindInstanceMethods(
    new RateLimiter<TFn>(fn, initialOptions),
  )

  const state = useStore(rateLimiter.store, selector)

  return {
    ...rateLimiter,
    state,
  } as unknown as SolidRateLimiter<TFn, TSelected> // omit `store` in favor of `state`
}
