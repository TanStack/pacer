import { createEffect, onCleanup } from 'solid-js'
import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { useStore } from '@tanstack/solid-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor, JSX } from 'solid-js'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'

export interface SolidAsyncThrottlerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncThrottlerOptions<TFn> {
  /**
   * Optional callback invoked when the owning component unmounts. Receives the throttler instance.
   * When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.
   */
  onUnmount?: (throttler: SolidAsyncThrottler<TFn, TSelected>) => void
}

export interface SolidAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncThrottler<TFn>, 'store'> {
  /**
   * A Solid component that allows you to subscribe to the throttler state.
   *
   * This is useful for tracking specific parts of the throttler state
   * deep in your component tree without needing to pass a selector to the hook.
   *
   * @example
   * <throttler.Subscribe selector={(state) => ({ isPending: state.isPending, isExecuting: state.isExecuting })}>
   *   {(state) => (
   *     <div>{state().isPending ? 'Pending...' : state().isExecuting ? 'Executing...' : 'Ready'}</div>
   *   )}
   * </throttler.Subscribe>
   */
  Subscribe: <TSelected>(props: {
    selector: (state: AsyncThrottlerState<TFn>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) => JSX.Element
  /**
   * Reactive state that will be updated when the throttler state changes
   *
   * Use this instead of `throttler.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>
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
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. You can subscribe to state changes
 * in two ways:
 *
 * **1. Using `throttler.Subscribe` component (Recommended for component tree subscriptions)**
 *
 * Use the `Subscribe` component to subscribe to state changes deep in your component tree without
 * needing to pass a selector to the hook. This is ideal when you want to subscribe to state
 * in child components.
 *
 * **2. Using the `selector` parameter (For hook-level subscriptions)**
 *
 * The `selector` parameter allows you to specify which state changes will trigger reactive updates
 * at the hook level, optimizing performance by preventing unnecessary updates when irrelevant
 * state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function or using the `Subscribe` component. This prevents unnecessary
 * updates and gives you full control over when your component tracks state changes.
 *
 * Available state properties:
 * - `canLeadingExecute`: Whether the throttler can execute on the leading edge
 * - `canTrailingExecute`: Whether the throttler can execute on the trailing edge
 * - `executionCount`: Number of function executions that have been completed
 * - `hasError`: Whether the last execution resulted in an error
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `isExecuting`: Whether an async function execution is currently in progress
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastError`: The error from the most recent failed execution (if any)
 * - `lastExecutionTime`: Timestamp of the last execution
 * - `lastResult`: The result from the most recent successful execution
 * - `nextExecutionTime`: Timestamp of the next allowed execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing')
 *
 * ## Unmount behavior
 *
 * By default, the primitive cancels any pending execution when the owning component unmounts.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```tsx
 * const throttler = createAsyncThrottler(fn, {
 *   wait: 1000,
 *   onUnmount: (t) => t.flush()
 * });
 * ```
 *
 * Note: For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup.
 * If your throttled function updates Solid signals, those updates may run after the component has
 * unmounted, which can cause unexpected reactive updates. Guard your callbacks accordingly when
 * using onUnmount with flush.
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const { maybeExecute } = createAsyncThrottler(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { wait: 1000 }
 * );
 *
 * // Opt-in to track isPending or isExecuting changes (optimized for loading states)
 * const throttler = createAsyncThrottler(
 *   async (query) => {
 *     const result = await searchAPI(query);
 *     return result;
 *   },
 *   { wait: 2000 },
 *   (state) => ({ isPending: state.isPending, isExecuting: state.isExecuting })
 * );
 *
 * // Opt-in to track error state changes (optimized for error handling)
 * const throttler = createAsyncThrottler(
 *   async (query) => {
 *     const result = await searchAPI(query);
 *     return result;
 *   },
 *   {
 *     wait: 2000,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false, // Skip trailing edge updates
 *     onError: (error) => {
 *       console.error('API call failed:', error);
 *     }
 *   },
 *   (state) => ({ hasError: state.hasError, lastError: state.lastError })
 * );
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isPending, isExecuting } = throttler.state();
 * ```
 */
export function createAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: SolidAsyncThrottlerOptions<TFn, TSelected>,
  selector: (state: AsyncThrottlerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): SolidAsyncThrottler<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncThrottler,
    ...options,
  } as SolidAsyncThrottlerOptions<TFn, TSelected>
  const asyncThrottler = new AsyncThrottler(
    fn,
    mergedOptions,
  ) as unknown as SolidAsyncThrottler<TFn, TSelected>

  asyncThrottler.Subscribe = function Subscribe<TSelected>(props: {
    selector: (state: AsyncThrottlerState<TFn>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) {
    const selected = useStore(asyncThrottler.store, props.selector)

    return typeof props.children === 'function'
      ? props.children(selected)
      : props.children
  }

  const state = useStore(asyncThrottler.store, selector)

  createEffect(() => {
    onCleanup(() => {
      if (mergedOptions.onUnmount) {
        mergedOptions.onUnmount(asyncThrottler)
      } else {
        asyncThrottler.cancel()
      }
    })
  })

  return {
    ...asyncThrottler,
    state,
  } as SolidAsyncThrottler<TFn, TSelected>
}
