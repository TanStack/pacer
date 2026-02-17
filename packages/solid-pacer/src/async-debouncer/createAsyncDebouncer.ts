import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { useStore } from '@tanstack/solid-store'
import { createEffect, onCleanup } from 'solid-js'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor, JSX } from 'solid-js'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

export interface SolidAsyncDebouncerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncDebouncerOptions<TFn> {
  /**
   * Optional callback invoked when the owning component unmounts. Receives the debouncer instance.
   * When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.
   */
  onUnmount?: (debouncer: SolidAsyncDebouncer<TFn, TSelected>) => void
}

export interface SolidAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncDebouncer<TFn>, 'store'> {
  /**
   * A Solid component that allows you to subscribe to the debouncer state.
   *
   * This is useful for tracking specific parts of the debouncer state
   * deep in your component tree without needing to pass a selector to the hook.
   *
   * @example
   * <debouncer.Subscribe selector={(state) => ({ isPending: state.isPending, isExecuting: state.isExecuting })}>
   *   {(state) => (
   *     <div>{state().isPending ? 'Waiting...' : state().isExecuting ? 'Executing...' : 'Ready'}</div>
   *   )}
   * </debouncer.Subscribe>
   */
  Subscribe: <TSelected>(props: {
    selector: (state: AsyncDebouncerState<TFn>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) => JSX.Element
  /**
   * Reactive state that will be updated when the debouncer state changes
   *
   * Use this instead of `debouncer.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>
}

/**
 * A low-level Solid hook that creates an `AsyncDebouncer` instance to delay execution of an async function.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a debouncer instance that
 * you can integrate with any state management solution (createSignal, etc).
 *
 * Async debouncing ensures that an async function only executes after a specified delay has passed since its last invocation.
 * Each new invocation resets the delay timer. This is useful for handling frequent events like window resizing
 * or input changes where you only want to execute the handler after the events have stopped occurring.
 *
 * Unlike throttling which allows execution at regular intervals, debouncing prevents any execution until
 * the function stops being called for the specified delay period.
 *
 * Unlike the non-async Debouncer, this async version supports returning values from the debounced function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the debounced function.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and debouncer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncDebouncer instance
 *
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. You can subscribe to state changes
 * in two ways:
 *
 * **1. Using `debouncer.Subscribe` component (Recommended for component tree subscriptions)**
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
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `executionCount`: Number of function executions that have been completed
 * - `hasError`: Whether the last execution resulted in an error
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `isExecuting`: Whether an async function execution is currently in progress
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastError`: The error from the most recent failed execution (if any)
 * - `lastResult`: The result from the most recent successful execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing')
 *
 * ## Unmount behavior
 *
 * By default, the primitive cancels any pending execution when the owning component unmounts.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```tsx
 * const debouncer = createAsyncDebouncer(fn, {
 *   wait: 500,
 *   onUnmount: (d) => d.flush()
 * });
 * ```
 *
 * Note: For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup.
 * If your debounced function updates Solid signals, those updates may run after the component has
 * unmounted, which can cause unexpected reactive updates. Guard your callbacks accordingly when
 * using onUnmount with flush.
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const { maybeExecute } = createAsyncDebouncer(
 *   async (query: string) => {
 *     const results = await api.search(query);
 *     return results;
 *   },
 *   { wait: 500 }
 * );
 *
 * // Opt-in to track isPending or isExecuting changes (optimized for loading states)
 * const debouncer = createAsyncDebouncer(
 *   async (query: string) => {
 *     const results = await api.search(query);
 *     return results;
 *   },
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending, isExecuting: state.isExecuting })
 * );
 *
 * // Opt-in to track error state changes (optimized for error handling)
 * const debouncer = createAsyncDebouncer(
 *   async (searchTerm) => {
 *     const data = await searchAPI(searchTerm);
 *     return data;
 *   },
 *   {
 *     wait: 300,
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
 * const { isPending, isExecuting } = debouncer.state();
 * ```
 */
export function createAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: SolidAsyncDebouncerOptions<TFn, TSelected>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): SolidAsyncDebouncer<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncDebouncer,
    ...options,
  } as SolidAsyncDebouncerOptions<TFn, TSelected>
  const asyncDebouncer = new AsyncDebouncer<TFn>(
    fn,
    mergedOptions,
  ) as unknown as SolidAsyncDebouncer<TFn, TSelected>

  asyncDebouncer.Subscribe = function Subscribe<TSelected>(props: {
    selector: (state: AsyncDebouncerState<TFn>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) {
    const selected = useStore(asyncDebouncer.store, props.selector)

    return typeof props.children === 'function'
      ? props.children(selected)
      : props.children
  }

  const state = useStore(asyncDebouncer.store, selector)

  createEffect(() => {
    onCleanup(() => {
      if (mergedOptions.onUnmount) {
        mergedOptions.onUnmount(asyncDebouncer)
      } else {
        asyncDebouncer.cancel()
      }
    })
  })

  return {
    ...asyncDebouncer,
    state,
  } as SolidAsyncDebouncer<TFn, TSelected> // omit `store` in favor of `state`
}
