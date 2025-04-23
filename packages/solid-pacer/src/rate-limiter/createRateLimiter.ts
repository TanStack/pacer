import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '../utils'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'

export interface SolidRateLimiter<
  TFn extends AnyFunction,
  TArgs extends Parameters<TFn>,
> extends Omit<
    RateLimiter<TFn, TArgs>,
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
 * you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).
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
 * The hook returns an object containing:
 * - maybeExecute: The rate-limited function that respects the configured limits
 * - getExecutionCount: Returns the number of successful executions
 * - getRejectionCount: Returns the number of rejected executions due to rate limiting
 * - getRemainingInWindow: Returns how many more executions are allowed in the current window
 * - reset: Resets the execution counts and window timing
 *
 * @example
 * ```tsx
 * // Basic rate limiting - max 5 calls per minute
 * const { maybeExecute } = createRateLimiter(apiCall, {
 *   limit: 5,
 *   window: 60000,
 * });
 *
 * // Monitor rate limit status
 * const handleClick = () => {
 *   const remaining = getRemainingInWindow();
 *   if (remaining > 0) {
 *     maybeExecute(data);
 *   } else {
 *     showRateLimitWarning();
 *   }
 * };
 * ```
 */
export function createRateLimiter<
  TFn extends AnyFunction,
  TArgs extends Parameters<TFn>,
>(
  fn: TFn,
  initialOptions: RateLimiterOptions<TFn, TArgs>,
): SolidRateLimiter<TFn, TArgs> {
  const rateLimiter = new RateLimiter<TFn, TArgs>(fn, initialOptions)

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

  function setOptions(newOptions: Partial<RateLimiterOptions<TFn, TArgs>>) {
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
    ...bindInstanceMethods(rateLimiter),
    executionCount,
    rejectionCount,
    remainingInWindow,
    msUntilNextWindow,
    setOptions,
  }
}
