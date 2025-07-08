import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { useStore } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

export interface SolidAsyncQueuer<TValue, TSelected = AsyncQueuerState<TValue>>
  extends Omit<AsyncQueuer<TValue>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the queuer state changes
   *
   * Use this instead of `queuer.store.state`
   */
  readonly state: Accessor<TSelected>
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
 * Example usage:
 * ```tsx
 * // Basic async queuer for API requests
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
 * // Add items to queue
 * asyncQueuer.addItem(newItem);
 *
 * // Start processing
 * asyncQueuer.start();
 *
 * // Use Solid signals in your UI
 * const pending = asyncQueuer.pendingItems();
 * ```
 */
export function createAsyncQueuer<TValue, TSelected = AsyncQueuerState<TValue>>(
  fn: (value: TValue) => Promise<any>,
  initialOptions: AsyncQueuerOptions<TValue> = {},
  selector?: (state: AsyncQueuerState<TValue>) => TSelected,
): SolidAsyncQueuer<TValue, TSelected> {
  const asyncQueuer = new AsyncQueuer<TValue>(fn, initialOptions)

  const state = useStore(asyncQueuer.store, selector)

  return {
    ...asyncQueuer,
    state,
  } as unknown as SolidAsyncQueuer<TValue, TSelected> // omit `store` in favor of `state`
}
