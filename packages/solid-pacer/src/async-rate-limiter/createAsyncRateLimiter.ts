import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
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
 * Rate limiting allows an async function to execute up to a specified limit within a time window,
 * then blocks subsequent calls until the window passes. This is useful for respecting API rate limits,
 * managing resource constraints, or controlling bursts of async operations.
 *
 * @example
 * ```tsx
 * // Basic API call rate limiting
 * const { maybeExecute } = createAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { limit: 5, window: 1000 } // 5 calls per second
 * );
 *
 * // With state management
 * const [data, setData] = createSignal(null);
 * const { maybeExecute } = createAsyncRateLimiter(
 *   async (query) => {
 *     const result = await searchAPI(query);
 *     setData(result);
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
    ...bindInstanceMethods(asyncRateLimiter),
    errorCount,
    remainingInWindow,
    msUntilNextWindow,
    rejectionCount,
    setOptions,
    settleCount,
    successCount,
  } as SolidAsyncRateLimiter<TFn>
}
