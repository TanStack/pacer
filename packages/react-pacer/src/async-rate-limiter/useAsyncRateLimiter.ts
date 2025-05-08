import { useState } from 'react'
import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { AsyncRateLimiterOptions } from '@tanstack/pacer/async-rate-limiter'

/**
 * A low-level React hook that creates an `AsyncRateLimiter` instance to limit how many times an async function can execute within a time window.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
 * you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).
 *
 * Rate limiting allows an async function to execute up to a specified limit within a time window,
 * then blocks subsequent calls until the window passes. This is useful for respecting API rate limits,
 * managing resource constraints, or controlling bursts of async operations.
 *
 * Unlike the non-async RateLimiter, this async version supports returning values from the rate-limited function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the rate-limited function.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * @example
 * ```tsx
 * // Basic API call rate limiting with return value
 * const { maybeExecute } = useAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data; // Return value is preserved
 *   },
 *   { limit: 5, window: 1000 } // 5 calls per second
 * );
 *
 * // With state management and return value
 * const [data, setData] = useState(null);
 * const { maybeExecute } = useAsyncRateLimiter(
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
export function useAsyncRateLimiter<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: AsyncRateLimiterOptions<TFn>,
): AsyncRateLimiter<TFn> {
  const [asyncRateLimiter] = useState(() =>
    bindInstanceMethods(new AsyncRateLimiter<TFn>(fn, options)),
  )

  asyncRateLimiter.setOptions(options)

  return asyncRateLimiter
}
