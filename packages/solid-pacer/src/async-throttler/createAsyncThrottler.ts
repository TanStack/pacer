import { createMemo, createSignal } from 'solid-js'
import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import type { AsyncThrottlerOptions } from '@tanstack/pacer/async-throttler'

/**
 * A low-level Solid hook that creates an `AsyncThrottler` instance to limit how often an async function can execute.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a throttler instance that
 * you can integrate with any state management solution (createSignal, Redux, Zustand, Jotai, etc).
 *
 * Async throttling ensures an async function executes at most once within a specified time window,
 * regardless of how many times it is called. This is useful for rate-limiting expensive API calls,
 * database operations, or other async tasks.
 *
 * @example
 * ```tsx
 * // Basic API call throttling
 * const { maybeExecute } = createAsyncThrottler(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { wait: 1000 }
 * );
 *
 * // With state management
 * const [data, setData] = createSignal(null);
 * const { maybeExecute } = createAsyncThrottler(
 *   async (query) => {
 *     const result = await searchAPI(query);
 *     setData(result);
 *   },
 *   {
 *     wait: 2000,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false  // Skip trailing edge updates
 *   }
 * );
 * ```
 */

export function createAsyncThrottler<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncThrottlerOptions) {
  const [asyncThrottler] = createSignal(
    () => new AsyncThrottler<TFn, TArgs>(fn, options),
  )

  const setOptions = createMemo(() =>
    asyncThrottler()().setOptions.bind(asyncThrottler),
  )

  setOptions()(options)

  return createMemo(
    () =>
      ({
        maybeExecute: asyncThrottler()().maybeExecute.bind(asyncThrottler),
        cancel: asyncThrottler()().cancel.bind(asyncThrottler),
        getExecutionCount:
          asyncThrottler()().getExecutionCount.bind(asyncThrottler),
        getNextExecutionTime:
          asyncThrottler()().getNextExecutionTime.bind(asyncThrottler),
      }) as const,
  )
}
