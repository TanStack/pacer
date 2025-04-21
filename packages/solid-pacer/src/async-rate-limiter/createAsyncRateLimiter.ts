import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '../utils'
import type { Accessor } from 'solid-js'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { AsyncRateLimiterOptions } from '@tanstack/pacer/async-rate-limiter'

export interface SolidAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TArgs extends Parameters<TFn>,
> extends Omit<
    AsyncRateLimiter<TFn, TArgs>,
    | 'getExecutionCount'
    | 'getRejectionCount'
    | 'getRemainingInWindow'
    | 'getMsUntilNextWindow'
  > {
  executionCount: Accessor<number>
  rejectionCount: Accessor<number>
  remainingInWindow: Accessor<number>
  msUntilNextWindow: Accessor<number>
}

/**
 * A low-level Solid hook that creates an `AsyncRateLimiter` instance to limit how many times an async function can execute within a time window.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
 * you can integrate with any state management solution (createSignal, Redux, Zustand, Jotai, etc).
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
export function createAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncRateLimiterOptions<TFn, TArgs>) {
  const asyncRateLimiter = new AsyncRateLimiter<TFn, TArgs>(fn, options)

  const [executionCount, setExecutionCount] = createSignal(
    asyncRateLimiter.getExecutionCount(),
  )
  const [rejectionCount, setRejectionCount] = createSignal(
    asyncRateLimiter.getRejectionCount(),
  )
  const [remainingInWindow, setRemainingInWindow] = createSignal(
    asyncRateLimiter.getRemainingInWindow(),
  )
  const [msUntilNextWindow, setMsUntilNextWindow] = createSignal(
    asyncRateLimiter.getMsUntilNextWindow(),
  )

  asyncRateLimiter.setOptions({
    ...options,
    onExecute: (rateLimiter) => {
      setExecutionCount(rateLimiter.getExecutionCount())
      setRemainingInWindow(rateLimiter.getRemainingInWindow())
      setMsUntilNextWindow(rateLimiter.getMsUntilNextWindow())
      options.onExecute?.(rateLimiter)
    },
    onReject: (rateLimiter) => {
      setRejectionCount(rateLimiter.getRejectionCount())
      setRemainingInWindow(rateLimiter.getRemainingInWindow())
      setMsUntilNextWindow(rateLimiter.getMsUntilNextWindow())
      options.onReject?.(rateLimiter)
    },
  })

  return {
    ...bindInstanceMethods(asyncRateLimiter),
    executionCount,
    rejectionCount,
    remainingInWindow,
    msUntilNextWindow,
  }
}
