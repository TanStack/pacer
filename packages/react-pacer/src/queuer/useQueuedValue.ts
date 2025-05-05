import { useEffect, useState } from 'react'
import { useQueuedState } from './useQueuedState'
import type { Queuer, QueuerOptions } from '@tanstack/pacer/queuer'

/**
 * A React hook that creates a queued value that processes state changes in order with an optional delay.
 * This hook uses useQueuer internally to manage a queue of state changes and apply them sequentially.
 *
 * The queued value will process changes in the order they are received, with optional delays between
 * processing each change. This is useful for handling state updates that need to be processed
 * in a specific order, like animations or sequential UI updates.
 *
 * The hook returns a tuple containing:
 * - The current queued value
 * - The queuer instance with control methods
 *
 * @example
 * ```tsx
 * // Queue state changes with a delay between each
 * const [value, queuer] = useQueuedValue(initialValue, {
 *   wait: 500, // Wait 500ms between processing each change
 *   started: true // Start processing immediately
 * });
 *
 * // Add changes to the queue
 * const handleChange = (newValue) => {
 *   queuer.addItem(newValue);
 * };
 *
 * // Control the queue
 * const pauseProcessing = () => {
 *   queuer.stop();
 * };
 *
 * const resumeProcessing = () => {
 *   queuer.start();
 * };
 * ```
 */
export function useQueuedValue<TValue>(
  initialValue: TValue,
  options: QueuerOptions<TValue> = {},
): [TValue, Queuer<TValue>] {
  const [value, setValue] = useState<TValue>(initialValue)

  const [, addItem, queuer] = useQueuedState<TValue>({
    started: true,
    ...options,
    onGetNextItem: (item, queuer) => {
      setValue(item)
      options.onGetNextItem?.(item, queuer)
    },
  })

  useEffect(() => {
    addItem(initialValue)
  }, [initialValue, addItem])

  return [value, queuer]
}
