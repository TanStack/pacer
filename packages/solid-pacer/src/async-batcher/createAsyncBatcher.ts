import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { useStore } from '@tanstack/solid-store'
import { createEffect, onCleanup } from 'solid-js'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor, JSX } from 'solid-js'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'

export interface SolidAsyncBatcherOptions<
  TValue,
  TSelected = {},
> extends AsyncBatcherOptions<TValue> {
  /**
   * Optional callback invoked when the owning component unmounts. Receives the batcher instance.
   * When provided, replaces the default cleanup (cancel + abort); use it to call flush(), reset(), cancel(), add logging, etc.
   */
  onUnmount?: (batcher: SolidAsyncBatcher<TValue, TSelected>) => void
}

export interface SolidAsyncBatcher<TValue, TSelected = {}> extends Omit<
  AsyncBatcher<TValue>,
  'store'
> {
  /**
   * A Solid component that allows you to subscribe to the batcher state.
   *
   * This is useful for tracking specific parts of the batcher state
   * deep in your component tree without needing to pass a selector to the hook.
   *
   * @example
   * <batcher.Subscribe selector={(state) => ({ size: state.size, isExecuting: state.isExecuting })}>
   *   {(state) => (
   *     <div>Batch: {state().size} items, {state().isExecuting ? 'Executing...' : 'Idle'}</div>
   *   )}
   * </batcher.Subscribe>
   */
  Subscribe: <TSelected>(props: {
    selector: (state: AsyncBatcherState<TValue>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) => JSX.Element
  /**
   * Reactive state that will be updated when the batcher state changes
   *
   * Use this instead of `batcher.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<AsyncBatcherState<TValue>>>
}

/**
 * Creates a Solid-compatible AsyncBatcher instance for managing asynchronous batches of items, exposing Solid signals for all stateful properties.
 *
 * This is the async version of the createBatcher hook. Unlike the sync version, this async batcher:
 * - Handles promises and returns results from batch executions
 * - Provides error handling with configurable error behavior
 * - Tracks success, error, and settle counts separately
 * - Has state tracking for when batches are executing
 * - Returns the result of the batch function execution
 *
 * Features:
 * - Configurable batch size and wait time
 * - Custom batch processing logic via getShouldExecute
 * - Event callbacks for monitoring batch operations
 * - Error handling for failed batch operations
 * - Automatic or manual batch processing
 * - All stateful properties (items, counts, etc.) are exposed as Solid signals for reactivity
 *
 * The batcher collects items and processes them in batches based on:
 * - Maximum batch size (number of items per batch)
 * - Time-based batching (process after X milliseconds)
 * - Custom batch processing logic via getShouldExecute
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and batcher instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together; the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncBatcher instance
 *
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. You can subscribe to state changes
 * in two ways:
 *
 * **1. Using `batcher.Subscribe` component (Recommended for component tree subscriptions)**
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
 * - `errorCount`: Number of failed batch executions
 * - `executionCount`: Total number of batch execution attempts (successful + failed)
 * - `hasError`: Whether the last batch execution resulted in an error
 * - `isExecuting`: Whether a batch execution is currently in progress
 * - `items`: Array of items currently queued for batching
 * - `lastError`: The error from the most recent failed batch execution (if any)
 * - `lastResult`: The result from the most recent successful batch execution
 * - `settleCount`: Number of batch executions that have completed (successful or failed)
 * - `successCount`: Number of successful batch executions
 *
 * ## Unmount behavior
 *
 * By default, the primitive cancels any pending batch and aborts any in-flight execution when the owning component unmounts.
 * Abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```tsx
 * const batcher = createAsyncBatcher(fn, {
 *   maxSize: 10,
 *   wait: 2000,
 *   onUnmount: (b) => b.flush()
 * });
 * ```
 *
 * Note: For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup.
 * If your batch function updates Solid signals, those updates may run after the component has
 * unmounted, which can cause unexpected reactive updates. Guard your callbacks accordingly when
 * using onUnmount with flush.
 *
 * Example usage:
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const asyncBatcher = createAsyncBatcher(
 *   async (items) => {
 *     const results = await Promise.all(items.map(item => processItem(item)));
 *     return results;
 *   },
 *   {
 *     maxSize: 10,
 *     wait: 2000,
 *     onSuccess: (result) => {
 *       console.log('Batch processed successfully:', result);
 *     },
 *     onError: (error) => {
 *       console.error('Batch processing failed:', error);
 *     }
 *   }
 * );
 *
 * // Opt-in to track items or isExecuting changes (optimized for UI updates)
 * const asyncBatcher = createAsyncBatcher(
 *   async (items) => {
 *     const results = await Promise.all(items.map(item => processItem(item)));
 *     return results;
 *   },
 *   { maxSize: 10, wait: 2000 },
 *   (state) => ({ items: state.items, isExecuting: state.isExecuting })
 * );
 *
 * // Opt-in to track error state changes (optimized for error handling)
 * const asyncBatcher = createAsyncBatcher(
 *   async (items) => {
 *     const results = await Promise.all(items.map(item => processItem(item)));
 *     return results;
 *   },
 *   { maxSize: 10, wait: 2000 },
 *   (state) => ({ hasError: state.hasError, lastError: state.lastError })
 * );
 *
 * // Add items to batch
 * asyncBatcher.addItem(newItem);
 *
 * // Manually execute batch
 * const result = await asyncBatcher.execute();
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { items, isExecuting } = asyncBatcher.state();
 * ```
 */
export function createAsyncBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: SolidAsyncBatcherOptions<TValue, TSelected> = {},
  selector: (state: AsyncBatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): SolidAsyncBatcher<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncBatcher,
    ...options,
  } as SolidAsyncBatcherOptions<TValue, TSelected>
  const asyncBatcher = new AsyncBatcher<TValue>(
    fn,
    mergedOptions,
  ) as unknown as SolidAsyncBatcher<TValue, TSelected>

  asyncBatcher.Subscribe = function Subscribe<TSelected>(props: {
    selector: (state: AsyncBatcherState<TValue>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) {
    const selected = useStore(asyncBatcher.store, props.selector)

    return typeof props.children === 'function'
      ? props.children(selected)
      : props.children
  }

  const state = useStore(asyncBatcher.store, selector)

  createEffect(() => {
    onCleanup(() => {
      if (mergedOptions.onUnmount) {
        mergedOptions.onUnmount(asyncBatcher)
      } else {
        asyncBatcher.cancel()
        asyncBatcher.abort()
      }
    })
  })

  return {
    ...asyncBatcher,
    state,
  } as SolidAsyncBatcher<TValue, TSelected> // omit `store` in favor of `state`
}
