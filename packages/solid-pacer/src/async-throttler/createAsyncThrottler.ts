import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { useStore } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'

export interface SolidAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = AsyncThrottlerState<TFn>,
> extends Omit<AsyncThrottler<TFn>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the throttler state changes
   *
   * Use this instead of `throttler.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
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
export function createAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = AsyncThrottlerState<TFn>,
>(
  fn: TFn,
  initialOptions: AsyncThrottlerOptions<TFn>,
  selector?: (state: AsyncThrottlerState<TFn>) => TSelected,
): SolidAsyncThrottler<TFn, TSelected> {
  const asyncThrottler = new AsyncThrottler(fn, initialOptions)

  const state = useStore(asyncThrottler.store, selector)

  return {
    ...asyncThrottler,
    state,
  } as SolidAsyncThrottler<TFn, TSelected>
}
