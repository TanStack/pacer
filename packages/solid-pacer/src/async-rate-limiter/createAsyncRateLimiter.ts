import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { createEffect, onCleanup } from 'solid-js'
import { useStore } from '@tanstack/solid-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor, JSX } from 'solid-js'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'

export interface SolidAsyncRateLimiterOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncRateLimiterOptions<TFn> {
  /**
   * Optional callback invoked when the owning component unmounts. Receives the async rate limiter instance.
   * When provided, replaces the default cleanup; use it to call reset(), add logging, etc.
   */
  onUnmount?: (rateLimiter: SolidAsyncRateLimiter<TFn, TSelected>) => void
}

export interface SolidAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'store'> {
  /**
   * A Solid component that allows you to subscribe to the rate limiter state.
   *
   * This is useful for tracking specific parts of the rate limiter state
   * deep in your component tree without needing to pass a selector to the hook.
   *
   * @example
   * <rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount, isExecuting: state.isExecuting })}>
   *   {(state) => (
   *     <div>Rejected: {state().rejectionCount}, {state().isExecuting ? 'Executing' : 'Idle'}</div>
   *   )}
   * </rateLimiter.Subscribe>
   */
  Subscribe: <TSelected>(props: {
    selector: (state: AsyncRateLimiterState<TFn>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) => JSX.Element
  /**
   * Reactive state that will be updated when the rate limiter state changes
   *
   * Use this instead of `rateLimiter.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>
}

/**
 * A low-level Solid hook that creates an `AsyncRateLimiter` instance to limit how many times an async function can execute within a time window.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
 * you can integrate with any state management solution (createSignal, etc).
 *
 * Rate limiting is a simple approach that allows a function to execute up to a limit within a time window,
 * then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
 * all executions happen immediately, followed by a complete block.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * Unlike the non-async RateLimiter, this async version supports returning values from the rate-limited function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the rate-limited function.
 *
 * For smoother execution patterns, consider using:
 * - Throttling: Ensures consistent spacing between executions (e.g. max once per 200ms)
 * - Debouncing: Waits for a pause in calls before executing (e.g. after 500ms of no calls)
 *
 * Rate limiting is best used for hard API limits or resource constraints. For UI updates or
 * smoothing out frequent events, throttling or debouncing usually provide better user experience.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and rate limiter instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncRateLimiter instance
 * - Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler
 *
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. You can subscribe to state changes
 * in two ways:
 *
 * **1. Using `rateLimiter.Subscribe` component (Recommended for component tree subscriptions)**
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
 * - `currentWindowStart`: Timestamp when the current window started
 * - `executionCount`: Number of function executions that have been completed
 * - `hasError`: Whether the last execution resulted in an error
 * - `isExecuting`: Whether an async function execution is currently in progress
 * - `lastError`: The error from the most recent failed execution (if any)
 * - `lastResult`: The result from the most recent successful execution
 * - `nextWindowTime`: Timestamp when the next window begins
 * - `rejectionCount`: Number of function calls that were rejected due to rate limiting
 * - `remainingInWindow`: Number of executions remaining in the current window
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const asyncRateLimiter = createAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data; // Return value is preserved
 *   },
 *   { limit: 5, window: 1000 } // 5 calls per second
 * );
 *
 * // Subscribe to state changes deep in component tree using Subscribe component
 * <asyncRateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount, isExecuting: state.isExecuting })}>
 *   {(state) => (
 *     <div>Rejected: {state().rejectionCount}, {state().isExecuting ? 'Executing' : 'Idle'}</div>
 *   )}
 * </asyncRateLimiter.Subscribe>
 *
 * // Opt-in to track execution state changes at hook level (optimized for loading indicators)
 * const asyncRateLimiter = createAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { limit: 5, window: 1000 },
 *   (state) => ({ isExecuting: state.isExecuting })
 * );
 *
 * // Opt-in to track results when available (optimized for data display)
 * const asyncRateLimiter = createAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { limit: 5, window: 1000 },
 *   (state) => ({
 *     lastResult: state.lastResult,
 *     successCount: state.successCount
 *   })
 * );
 *
 * // Opt-in to track error/rejection state changes (optimized for error handling)
 * const asyncRateLimiter = createAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   {
 *     limit: 5,
 *     window: 1000,
 *     onError: (error) => console.error('API call failed:', error),
 *     onReject: (rateLimiter) => console.log('Rate limit exceeded')
 *   },
 *   (state) => ({
 *     errorCount: state.errorCount,
 *     rejectionCount: state.rejectionCount
 *   })
 * );
 *
 * // Opt-in to track execution metrics changes (optimized for stats display)
 * const asyncRateLimiter = createAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { limit: 5, window: 1000 },
 *   (state) => ({
 *     successCount: state.successCount,
 *     errorCount: state.errorCount,
 *     settleCount: state.settleCount,
 *     rejectionCount: state.rejectionCount
 *   })
 * );
 *
 * // Opt-in to track execution times changes (optimized for window calculations)
 * const asyncRateLimiter = createAsyncRateLimiter(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { limit: 5, window: 1000 },
 *   (state) => ({ executionTimes: state.executionTimes })
 * );
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isExecuting, lastResult, rejectionCount } = asyncRateLimiter.state();
 * ```
 */
export function createAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: SolidAsyncRateLimiterOptions<TFn, TSelected>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): SolidAsyncRateLimiter<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncRateLimiter,
    ...options,
  } as SolidAsyncRateLimiterOptions<TFn, TSelected>
  const asyncRateLimiter = new AsyncRateLimiter<TFn>(
    fn,
    mergedOptions,
  ) as unknown as SolidAsyncRateLimiter<TFn, TSelected>

  asyncRateLimiter.Subscribe = function Subscribe<TSelected>(props: {
    selector: (state: AsyncRateLimiterState<TFn>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) {
    const selected = useStore(asyncRateLimiter.store, props.selector)

    return typeof props.children === 'function'
      ? props.children(selected)
      : props.children
  }

  const state = useStore(asyncRateLimiter.store, selector)

  createEffect(() => {
    onCleanup(() => {
      if (mergedOptions.onUnmount) {
        mergedOptions.onUnmount(asyncRateLimiter)
      }
    })
  })

  return {
    ...asyncRateLimiter,
    state,
  } as SolidAsyncRateLimiter<TFn, TSelected>
}
