import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { useStore } from '@tanstack/solid-store'
import { createEffect, onCleanup } from 'solid-js'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor, JSX } from 'solid-js'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

export interface SolidAsyncQueuerOptions<
  TValue,
  TSelected = {},
> extends AsyncQueuerOptions<TValue> {
  /**
   * Optional callback invoked when the owning component unmounts. Receives the queuer instance.
   * When provided, replaces the default cleanup (stop + abort); use it to call flush(), flushAsBatch(), stop(), add logging, etc.
   */
  onUnmount?: (queuer: SolidAsyncQueuer<TValue, TSelected>) => void
}

export interface SolidAsyncQueuer<TValue, TSelected = {}> extends Omit<
  AsyncQueuer<TValue>,
  'store'
> {
  /**
   * A Solid component that allows you to subscribe to the queuer state.
   *
   * This is useful for tracking specific parts of the queuer state
   * deep in your component tree without needing to pass a selector to the hook.
   *
   * @example
   * <queuer.Subscribe selector={(state) => ({ pendingItems: state.pendingItems, activeItems: state.activeItems })}>
   *   {(state) => (
   *     <div>Pending: {state().pendingItems.length}, Active: {state().activeItems.length}</div>
   *   )}
   * </queuer.Subscribe>
   */
  Subscribe: <TSelected>(props: {
    selector: (state: AsyncQueuerState<TValue>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) => JSX.Element
  /**
   * Reactive state that will be updated when the queuer state changes
   *
   * Use this instead of `queuer.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<AsyncQueuerState<TValue>>>
}

/**
 * Creates a Solid-compatible AsyncQueuer instance for managing an asynchronous queue of items, exposing Solid signals for all stateful properties.
 *
 * Features:
 * - Priority queueing via `getPriority` or item `priority` property
 * - Configurable concurrency limit
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Pause/resume processing
 * - Task cancellation
 * - Item expiration
 * - Lifecycle callbacks for success, error, settled, items change, etc.
 * - All stateful properties (active items, pending items, counts, etc.) are exposed as Solid signals for reactivity
 *
 * Tasks are processed concurrently up to the configured concurrency limit. When a task completes,
 * the next pending task is processed if the concurrency limit allows.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and queuer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together; the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncQueuer instance
 *
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. You can subscribe to state changes
 * in two ways:
 *
 * **1. Using `queuer.Subscribe` component (Recommended for component tree subscriptions)**
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
 * - `activeItems`: Array of items currently being processed
 * - `errorCount`: Number of items that failed processing
 * - `isRunning`: Whether the queuer is currently running (not stopped)
 * - `pendingItems`: Array of items waiting to be processed
 * - `rejectionCount`: Number of items that were rejected (expired or failed validation)
 * - `settleCount`: Number of items that have completed processing (successful or failed)
 * - `successCount`: Number of items that were processed successfully
 *
 * ## Unmount behavior
 *
 * By default, the primitive stops the queuer and aborts any in-flight task executions when the owning component unmounts.
 * Abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them.
 * Use the `onUnmount` option to customize this. For example, to flush pending items instead:
 *
 * ```tsx
 * const queuer = createAsyncQueuer(fn, {
 *   concurrency: 2,
 *   started: false,
 *   onUnmount: (q) => q.flush()
 * });
 * ```
 *
 * Note: For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup.
 * If your task function updates Solid signals, those updates may run after the component has
 * unmounted, which can cause unexpected reactive updates. Guard your callbacks accordingly when
 * using onUnmount with flush.
 *
 * Example usage:
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const asyncQueuer = createAsyncQueuer(async (item) => {
 *   // process item
 *   return await fetchData(item);
 * }, {
 *   initialItems: [],
 *   concurrency: 2,
 *   maxSize: 100,
 *   started: false,
 *   onSuccess: (result) => {
 *     console.log('Item processed:', result);
 *   },
 *   onError: (error) => {
 *     console.error('Processing failed:', error);
 *   }
 * });
 *
 * // Opt-in to track queue state changes (optimized for UI updates)
 * const asyncQueuer = createAsyncQueuer(
 *   async (item) => await fetchData(item),
 *   { concurrency: 2, started: true },
 *   (state) => ({
 *     pendingItems: state.pendingItems,
 *     activeItems: state.activeItems,
 *     isRunning: state.isRunning
 *   })
 * );
 *
 * // Opt-in to track processing metrics changes (optimized for tracking progress)
 * const asyncQueuer = createAsyncQueuer(
 *   async (item) => await fetchData(item),
 *   { concurrency: 2, started: true },
 *   (state) => ({
 *     successCount: state.successCount,
 *     errorCount: state.errorCount,
 *     settleCount: state.settleCount
 *   })
 * );
 *
 * // Add items to queue
 * asyncQueuer.addItem(newItem);
 *
 * // Start processing
 * asyncQueuer.start();
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { pendingItems, activeItems } = asyncQueuer.state();
 * ```
 */
export function createAsyncQueuer<TValue, TSelected = {}>(
  fn: (value: TValue) => Promise<any>,
  options: SolidAsyncQueuerOptions<TValue, TSelected> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): SolidAsyncQueuer<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncQueuer,
    ...options,
  } as SolidAsyncQueuerOptions<TValue, TSelected>
  const asyncQueuer = new AsyncQueuer<TValue>(
    fn,
    mergedOptions,
  ) as unknown as SolidAsyncQueuer<TValue, TSelected>

  asyncQueuer.Subscribe = function Subscribe<TSelected>(props: {
    selector: (state: AsyncQueuerState<TValue>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) {
    const selected = useStore(asyncQueuer.store, props.selector)

    return typeof props.children === 'function'
      ? props.children(selected)
      : props.children
  }

  const state = useStore(asyncQueuer.store, selector)

  createEffect(() => {
    onCleanup(() => {
      if (mergedOptions.onUnmount) {
        mergedOptions.onUnmount(asyncQueuer)
      } else {
        asyncQueuer.stop()
        asyncQueuer.abort()
      }
    })
  })

  return {
    ...asyncQueuer,
    state,
  } as SolidAsyncQueuer<TValue, TSelected> // omit `store` in favor of `state`
}
