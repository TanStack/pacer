import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { createSignal } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { AsyncRateLimiterOptions } from '@tanstack/pacer/async-rate-limiter'

export interface SolidAsyncRateLimiter<TFn extends AnyAsyncFunction>
  extends Omit<
    AsyncRateLimiter<TFn>,
    | 'getSuccessCount'
    | 'getSettleCount'
    | 'getErrorCount'
    | 'getRejectionCount'
    | 'getRemainingInWindow'
    | 'getMsUntilNextWindow'
  > {
  successCount: Accessor<number>
  settleCount: Accessor<number>
  errorCount: Accessor<number>
  rejectionCount: Accessor<number>
  remainingInWindow: Accessor<number>
  msUntilNextWindow: Accessor<number>
}

/**
 * A low-level Solid hook that creates an `AsyncRateLimiter` instance to limit how many times an async function can execute within a time window.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
 * you can integrate with any state management solution (createSignal, etc).
 *
 * Rate limiting is a simple approach that allows a function to execute up to a limit within a time window,
 * then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
 * all executions happen immediately, followed by a complete block.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * Unlike the non-async RateLimiter, this async version supports returning values from the rate-limited function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the rate-limited function.
 *
 * For smoother execution patterns, consider using:
 * - Throttling: Ensures consistent spacing between executions (e.g. max once per 200ms)
 * - Debouncing: Waits for a pause in calls before executing (e.g. after 500ms of no calls)
 *
 * Rate limiting is best used for hard API limits or resource constraints. For UI updates or
 * smoothing out frequent events, throttling or debouncing usually provide better user experience.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and rate limiter instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncRateLimiter instance
 * - Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler
 *
 * @example
 * ```tsx
 * // Basic API call rate limiting with return value
 * const { maybeExecute } = createAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data; // Return value is preserved
 *   },
 *   { limit: 5, window: 1000 } // 5 calls per second
 * );
 *
 * // With state management and return value
 * const [data, setData] = createSignal(null);
 * const { maybeExecute } = createAsyncRateLimiter(
 *   async (query) => {
 *     const result = await searchAPI(query);
 *     setData(result);
 *     return result; // Return value can be used by the caller
 *   },
 *   {
 *     limit: 10,
 *     window: 60000, // 10 calls per minute
 *     onReject: (info) => console.log(`Rate limit exceeded: ${info.nextValidTime - Date.now()}ms until next window`)
 *   }
 * );
 * ```
 */
export function createAsyncRateLimiter<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncRateLimiterOptions<TFn>,
): SolidAsyncRateLimiter<TFn> {
  const asyncRateLimiter = new AsyncRateLimiter<TFn>(fn, initialOptions)

  const [successCount, setSuccessCount] = createSignal(
    asyncRateLimiter.getSuccessCount(),
  )
  const [rejectionCount, setRejectionCount] = createSignal(
    asyncRateLimiter.getRejectionCount(),
  )
  const [errorCount, setErrorCount] = createSignal(
    asyncRateLimiter.getErrorCount(),
  )
  const [settleCount, setSettleCount] = createSignal(
    asyncRateLimiter.getSettleCount(),
  )
  const [remainingInWindow, setRemainingInWindow] = createSignal(
    asyncRateLimiter.getRemainingInWindow(),
  )
  const [msUntilNextWindow, setMsUntilNextWindow] = createSignal(
    asyncRateLimiter.getMsUntilNextWindow(),
  )

  function setOptions(newOptions: Partial<AsyncRateLimiterOptions<TFn>>) {
    asyncRateLimiter.setOptions({
      ...newOptions,
      onSettled: (rateLimiter) => {
        setSuccessCount(rateLimiter.getSuccessCount())
        setSettleCount(rateLimiter.getSettleCount())
        setErrorCount(rateLimiter.getErrorCount())
        setRejectionCount(rateLimiter.getRejectionCount())
        setRemainingInWindow(rateLimiter.getRemainingInWindow())
        setMsUntilNextWindow(rateLimiter.getMsUntilNextWindow())

        const onSettled = newOptions.onSettled ?? initialOptions.onSettled
        onSettled?.(rateLimiter)
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
    ...asyncRateLimiter,
    errorCount,
    remainingInWindow,
    msUntilNextWindow,
    rejectionCount,
    setOptions,
    settleCount,
    successCount,
  } as SolidAsyncRateLimiter<TFn>
}
