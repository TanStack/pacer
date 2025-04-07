import { createMemo, createSignal } from 'solid-js'
import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import type { AsyncQueuerOptions } from '@tanstack/pacer/async-queuer'

/**
 * A lower-level React hook that creates an `AsyncQueuer` instance for managing an async queue of items.
 *
 * This hook provides a flexible, state-management agnostic way to handle queued async operations.
 * It returns a queuer instance with methods to add items, control queue execution, and monitor queue state.
 *
 * The queue can be configured with:
 * - Maximum concurrent operations
 * - Maximum queue size
 * - Processing function for queue items
 * - Various lifecycle callbacks
 *
 * The hook returns an object containing methods to:
 * - Add/remove items from the queue
 * - Start/stop queue processing
 * - Get queue status and items
 * - Register event handlers
 * - Control execution throttling
 *
 * @example
 * ```tsx
 * // Basic async queuer for API requests
 * const asyncQueuer = useAsyncQueuer({
 *   initialItems: [],
 *   concurrency: 2,
 *   maxSize: 100,
 *   started: false,
 * });
 *
 * // Add items to queue
 * asyncQueuer.addItem(newItem);
 *
 * // Start processing
 * asyncQueuer.start();
 *
 * // Monitor queue state
 * const isPending = !asyncQueuer.isIdle();
 * const itemCount = asyncQueuer.size();
 *
 * // Handle results
 * asyncQueuer.onSuccess((result) => {
 *   console.log('Item processed:', result);
 * });
 *
 * asyncQueuer.onError((error) => {
 *   console.error('Processing failed:', error);
 * });
 * ```
 */
export function useAsyncQueuer<TValue>(
  options: AsyncQueuerOptions<TValue> = {},
) {
  const [asyncQueuer] = createSignal(() => new AsyncQueuer<TValue>(options))

  const setOptions = createMemo(() =>
    asyncQueuer()().setOptions.bind(asyncQueuer),
  )

  setOptions()(options)

  return createMemo(
    () =>
      ({
        addItem: asyncQueuer()().addItem.bind(asyncQueuer()),
        clear: asyncQueuer()().clear.bind(asyncQueuer()),
        getActiveItems: asyncQueuer()().getActiveItems.bind(asyncQueuer()),
        getAllItems: asyncQueuer()().getAllItems.bind(asyncQueuer()),
        getExecutionCount:
          asyncQueuer()().getExecutionCount.bind(asyncQueuer()),
        getNextItem: asyncQueuer()().getNextItem.bind(asyncQueuer()),
        getPendingItems: asyncQueuer()().getPendingItems.bind(asyncQueuer()),
        isEmpty: asyncQueuer()().isEmpty.bind(asyncQueuer()),
        isFull: asyncQueuer()().isFull.bind(asyncQueuer()),
        isIdle: asyncQueuer()().isIdle.bind(asyncQueuer()),
        isRunning: asyncQueuer()().isRunning.bind(asyncQueuer()),
        onError: asyncQueuer()().onError.bind(asyncQueuer()),
        onSettled: asyncQueuer()().onSettled.bind(asyncQueuer()),
        onSuccess: asyncQueuer()().onSuccess.bind(asyncQueuer()),
        peek: asyncQueuer()().peek.bind(asyncQueuer()),
        reset: asyncQueuer()().reset.bind(asyncQueuer()),
        size: asyncQueuer()().size.bind(asyncQueuer()),
        start: asyncQueuer()().start.bind(asyncQueuer()),
        stop: asyncQueuer()().stop.bind(asyncQueuer()),
      }) as const,
  )
}
