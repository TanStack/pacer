import { useMemo, useState } from 'react'
import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { useStore } from '@tanstack/react-store'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

export interface ReactAsyncQueuer<TValue, TSelected = AsyncQueuerState<TValue>>
  extends Omit<AsyncQueuer<TValue>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the queuer state changes
   *
   * Use this instead of `queuer.store.state`
   */
  readonly state: TSelected
}

/**
 * A lower-level React hook that creates an `AsyncQueuer` instance for managing an async queue of items.
 *
 * Features:
 * - Priority queue support via getPriority option
 * - Configurable concurrency limit
 * - Task success/error/completion callbacks
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Pause/resume task processing
 * - Task cancellation
 * - Item expiration to clear stale items from the queue
 *
 * Tasks are processed concurrently up to the configured concurrency limit. When a task completes,
 * the next pending task is processed if below the concurrency limit.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and queuer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncQueuer instance
 *
 * @example
 * ```tsx
 * // Basic async queuer for API requests
 * const asyncQueuer = useAsyncQueuer({
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
 * ```
 */
export function useAsyncQueuer<TValue, TSelected = AsyncQueuerState<TValue>>(
  fn: (value: TValue) => Promise<any>,
  options: AsyncQueuerOptions<TValue> = {},
  selector?: (state: AsyncQueuerState<TValue>) => TSelected,
): ReactAsyncQueuer<TValue, TSelected> {
  const [asyncQueuer] = useState(() => new AsyncQueuer<TValue>(fn, options))

  const state = useStore(asyncQueuer.store, selector)

  asyncQueuer.setOptions(options)

  return useMemo(
    () =>
      ({
        ...asyncQueuer,
        state,
      }) as unknown as ReactAsyncQueuer<TValue, TSelected>, // omit `store` in favor of `state`
    [asyncQueuer, state],
  )
}
