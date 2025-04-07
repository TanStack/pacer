import { createMemo, createSignal } from 'solid-js'
import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import type { AsyncRateLimiterOptions } from '@tanstack/pacer/async-rate-limiter'

/**
 * A low-level React hook that creates an `AsyncRateLimiter` instance to limit how many times an async function can execute within a time window.
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
 * const { maybeExecute } = useAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { limit: 5, window: 1000 } // 5 calls per second
 * );
 *
 * // With state management
 * const [data, setData] = createSignal(null);
 * const { maybeExecute } = useAsyncRateLimiter(
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
export function useAsyncRateLimiter<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncRateLimiterOptions) {
  const [asyncRateLimiter] = createSignal(
    () => new AsyncRateLimiter<TFn, TArgs>(fn, options),
  )

  const setOptions = createMemo(
    () => asyncRateLimiter()().setOptions.bind(asyncRateLimiter),
    [asyncRateLimiter],
  )

  setOptions()(options)

  return createMemo(
    () =>
      ({
        maybeExecute: asyncRateLimiter()().maybeExecute.bind(asyncRateLimiter),
        getExecutionCount:
          asyncRateLimiter()().getExecutionCount.bind(asyncRateLimiter),
        getRejectionCount:
          asyncRateLimiter()().getRejectionCount.bind(asyncRateLimiter),
        reset: asyncRateLimiter()().reset.bind(asyncRateLimiter),
        getRemainingInWindow:
          asyncRateLimiter()().getRemainingInWindow.bind(asyncRateLimiter),
      }) as const,
    [asyncRateLimiter],
  )
}
