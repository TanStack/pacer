import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { createSignal } from 'solid-js'
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
 * Unlike the non-async Throttler, this async version supports returning values from the throttled function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the throttled function.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and throttler instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncThrottler instance
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
 *     trailing: false, // Skip trailing edge updates
 *     onError: (error) => {
 *       console.error('API call failed:', error);
 *     }
 *   }
 * );
 * ```
 */
export function createAsyncThrottler<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncThrottlerOptions<TFn>,
): SolidAsyncThrottler<TFn> {
  const asyncThrottler = new AsyncThrottler<TFn>(fn, initialOptions)

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
