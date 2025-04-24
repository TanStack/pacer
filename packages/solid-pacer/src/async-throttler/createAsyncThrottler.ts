import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { AsyncThrottlerOptions } from '@tanstack/pacer/async-throttler'

export interface SolidAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TArgs extends Parameters<TFn>,
> extends Omit<
    AsyncThrottler<TFn, TArgs>,
    | 'getExecutionCount'
    | 'getIsPending'
    | 'getLastExecutionTime'
    | 'getNextExecutionTime'
  > {
  executionCount: Accessor<number>
  isPending: Accessor<boolean>
  lastExecutionTime: Accessor<number>
  nextExecutionTime: Accessor<number>
}

/**
 * A low-level Solid hook that creates an `AsyncThrottler` instance to limit how often an async function can execute.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a throttler instance that
 * you can integrate with any state management solution (createSignal, etc).
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
  TFn extends AnyAsyncFunction,
  TArgs extends Parameters<TFn>,
>(
  fn: TFn,
  initialOptions: AsyncThrottlerOptions<TFn, TArgs>,
): SolidAsyncThrottler<TFn, TArgs> {
  const asyncThrottler = new AsyncThrottler<TFn, TArgs>(fn, initialOptions)

  const [executionCount, setExecutionCount] = createSignal(
    asyncThrottler.getExecutionCount(),
  )
  const [isPending, setIsPending] = createSignal(asyncThrottler.getIsPending())
  const [lastExecutionTime, setLastExecutionTime] = createSignal(
    asyncThrottler.getLastExecutionTime(),
  )
  const [nextExecutionTime, setNextExecutionTime] = createSignal(
    asyncThrottler.getNextExecutionTime(),
  )

  function setOptions(newOptions: Partial<AsyncThrottlerOptions<TFn, TArgs>>) {
    asyncThrottler.setOptions({
      ...newOptions,
      onExecute: (throttler) => {
        setExecutionCount(throttler.getExecutionCount())
        setIsPending(throttler.getIsPending())
        setLastExecutionTime(throttler.getLastExecutionTime())
        setNextExecutionTime(throttler.getNextExecutionTime())

        const onExecute = newOptions.onExecute ?? initialOptions.onExecute
        onExecute?.(throttler)
      },
    })
  }

  setOptions(initialOptions)

  return {
    ...bindInstanceMethods(asyncThrottler),
    executionCount,
    isPending,
    lastExecutionTime,
    nextExecutionTime,
    setOptions,
  }
}
