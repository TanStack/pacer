import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'

export interface SolidRateLimiter<TFn extends AnyFunction>
  extends Omit<
    RateLimiter<TFn>,
    | 'getExecutionCount'
    | 'getMsUntilNextWindow'
    | 'getRejectionCount'
    | 'getRemainingInWindow'
  > {
  executionCount: Accessor<number>
  msUntilNextWindow: Accessor<number>
  rejectionCount: Accessor<number>
  remainingInWindow: Accessor<number>
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
 * For smoother execution patterns:
 * - Use throttling when you want consistent spacing between executions (e.g. UI updates)
 * - Use debouncing when you want to collapse rapid-fire events (e.g. search input)
 * - Use rate limiting only when you need to enforce hard limits (e.g. API rate limits)
 *
 * @example
 * ```tsx
 * // Basic rate limiting - max 5 calls per minute
 * const rateLimiter = createRateLimiter(apiCall, {
 *   limit: 5,
 *   window: 60000,
 * });
 *
 * // Monitor rate limit status
 * const handleClick = () => {
 *   if (rateLimiter.remainingInWindow() > 0) {
 *     rateLimiter.maybeExecute(data);
 *   } else {
 *     showRateLimitWarning();
 *   }
 * };
 *
 * // Access rate limiter state via signals
 * console.log('Executions:', rateLimiter.executionCount());
 * console.log('Rejections:', rateLimiter.rejectionCount());
 * console.log('Remaining:', rateLimiter.remainingInWindow());
 * console.log('Next window in:', rateLimiter.msUntilNextWindow());
 * ```
 */
export function createRateLimiter<TFn extends AnyFunction>(
  fn: TFn,
  initialOptions: RateLimiterOptions<TFn>,
): SolidRateLimiter<TFn> {
  const rateLimiter = bindInstanceMethods(
    new RateLimiter<TFn>(fn, initialOptions),
  )

  const [executionCount, setExecutionCount] = createSignal(
    rateLimiter.getExecutionCount(),
  )
  const [rejectionCount, setRejectionCount] = createSignal(
    rateLimiter.getRejectionCount(),
  )
  const [remainingInWindow, setRemainingInWindow] = createSignal(
    rateLimiter.getRemainingInWindow(),
  )
  const [msUntilNextWindow, setMsUntilNextWindow] = createSignal(
    rateLimiter.getMsUntilNextWindow(),
  )

  function setOptions(newOptions: Partial<RateLimiterOptions<TFn>>) {
    rateLimiter.setOptions({
      ...newOptions,
      onExecute: (rateLimiter) => {
        setExecutionCount(rateLimiter.getExecutionCount())
        setRemainingInWindow(rateLimiter.getRemainingInWindow())
        setMsUntilNextWindow(rateLimiter.getMsUntilNextWindow())

        const onExecute = newOptions.onExecute ?? initialOptions.onExecute
        onExecute?.(rateLimiter)
      },
      onReject: (rateLimiter) => {
        setRejectionCount(rateLimiter.getRejectionCount())
        setRemainingInWindow(rateLimiter.getRemainingInWindow())
        setMsUntilNextWindow(rateLimiter.getMsUntilNextWindow())

        const onReject = newOptions.onReject ?? initialOptions.onReject
        onReject?.(rateLimiter)
      },
    })
  }

  setOptions(initialOptions)

  return {
    ...rateLimiter,
    executionCount,
    rejectionCount,
    remainingInWindow,
    msUntilNextWindow,
    setOptions,
  } as SolidRateLimiter<TFn>
}
