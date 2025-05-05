import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { AsyncThrottlerOptions } from '@tanstack/pacer/async-throttler'

export interface SolidAsyncThrottler<TFn extends AnyAsyncFunction>
  extends Omit<
    AsyncThrottler<TFn>,
    | 'getSuccessCount'
    | 'getSettleCount'
    | 'getErrorCount'
    | 'getIsPending'
    | 'getIsExecuting'
    | 'getLastResult'
    | 'getLastExecutionTime'
    | 'getNextExecutionTime'
  > {
  successCount: Accessor<number>
  settleCount: Accessor<number>
  errorCount: Accessor<number>
  isPending: Accessor<boolean>
  isExecuting: Accessor<boolean>
  lastResult: Accessor<ReturnType<TFn> | undefined>
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

export function createAsyncThrottler<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncThrottlerOptions<TFn>,
): SolidAsyncThrottler<TFn> {
  const asyncThrottler = bindInstanceMethods(
    new AsyncThrottler<TFn>(fn, initialOptions),
  )

  const [successCount, setSuccessCount] = createSignal(
    asyncThrottler.getSuccessCount(),
  )
  const [settleCount, setSettleCount] = createSignal(
    asyncThrottler.getSettleCount(),
  )
  const [errorCount, setErrorCount] = createSignal(
    asyncThrottler.getErrorCount(),
  )
  const [isPending, setIsPending] = createSignal(asyncThrottler.getIsPending())
  const [isExecuting, setIsExecuting] = createSignal(
    asyncThrottler.getIsExecuting(),
  )
  const [lastResult, setLastResult] = createSignal(
    asyncThrottler.getLastResult(),
  )
  const [lastExecutionTime, setLastExecutionTime] = createSignal(
    asyncThrottler.getLastExecutionTime(),
  )
  const [nextExecutionTime, setNextExecutionTime] = createSignal(
    asyncThrottler.getNextExecutionTime(),
  )

  function setOptions(newOptions: Partial<AsyncThrottlerOptions<TFn>>) {
    asyncThrottler.setOptions({
      ...newOptions,
      onSettled: (throttler) => {
        setSuccessCount(throttler.getSuccessCount())
        setSettleCount(throttler.getSettleCount())
        setErrorCount(throttler.getErrorCount())
        setIsPending(throttler.getIsPending())
        setIsExecuting(throttler.getIsExecuting())
        setLastExecutionTime(throttler.getLastExecutionTime())
        setNextExecutionTime(throttler.getNextExecutionTime())
        setLastResult(throttler.getLastResult())

        const onSettled = newOptions.onSettled ?? initialOptions.onSettled
        onSettled?.(throttler)
      },
    })
  }

  setOptions(initialOptions)

  return {
    ...asyncThrottler,
    errorCount,
    isExecuting,
    isPending,
    lastExecutionTime,
    lastResult,
    nextExecutionTime,
    setOptions,
    settleCount,
    successCount,
  } as SolidAsyncThrottler<TFn>
}
