import { useState } from 'react'
import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type {
  AsyncQueuerFn,
  AsyncQueuerOptions,
} from '@tanstack/pacer/async-queuer'

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
export function useAsyncQueuer<TFn extends AsyncQueuerFn>(
  options: AsyncQueuerOptions<TFn> = {},
): AsyncQueuer<TFn> {
  const [asyncQueuer] = useState(() =>
    bindInstanceMethods(new AsyncQueuer<TFn>(options)),
  )

  return asyncQueuer
}
