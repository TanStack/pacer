import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { useStore } from '@tanstack/solid-store'
import type { Store } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

export interface SolidAsyncQueuer<TValue, TSelected = {}>
  extends Omit<AsyncQueuer<TValue>, 'store'> {
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
 * The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
 * to specify which state changes will trigger a re-render, optimizing performance by preventing
 * unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary re-renders and gives you
 * full control over when your component updates. Only when you provide a selector will the
 * component re-render when the selected state values change.
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
 * // Opt-in to re-render when queue state changes (optimized for UI updates)
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
 * // Opt-in to re-render when processing metrics change (optimized for tracking progress)
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
  initialOptions: AsyncQueuerOptions<TValue> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): SolidAsyncQueuer<TValue, TSelected> {
  const asyncQueuer = new AsyncQueuer<TValue>(fn, initialOptions)

  const state = useStore(asyncQueuer.store, selector)

  return {
    ...asyncQueuer,
    state,
  } as SolidAsyncQueuer<TValue, TSelected> // omit `store` in favor of `state`
}
