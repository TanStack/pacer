import { useState } from 'react'
import { Batcher } from '@tanstack/pacer/batcher'
import type { BatcherOptions } from '@tanstack/pacer/batcher'

/**
 * A React hook that creates and manages a Batcher instance.
 *
 * This is a lower-level hook that provides direct access to the Batcher's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (useState, Redux, Zustand, etc.) by utilizing the onItemsChange callback.
 *
 * The Batcher collects items and processes them in batches based on configurable conditions:
 * - Maximum batch size
 * - Time-based batching (process after X milliseconds)
 * - Custom batch processing logic via getShouldExecute
 *
 * @example
 * ```tsx
 * // Example with custom state management and batching
 * const [items, setItems] = useState([]);
 *
 * const batcher = useBatcher<number>(
 *   (items) => console.log('Processing batch:', items),
 *   {
 *     maxSize: 5,
 *     wait: 2000,
 *     onItemsChange: (batcher) => setItems(batcher.peekAllItems()),
 *     getShouldExecute: (items) => items.length >= 3
 *   }
 * );
 *
 * // Add items to batch - they'll be processed when conditions are met
 * batcher.addItem(1);
 * batcher.addItem(2);
 * batcher.addItem(3); // Triggers batch processing
 *
 * // Control the batcher
 * batcher.stop();  // Pause batching
 * batcher.start(); // Resume batching
 * ```
 */
export function useBatcher<TValue>(
  fn: (items: Array<TValue>) => void,
  options: BatcherOptions<TValue> = {},
): Batcher<TValue> {
  const [batcher] = useState(() => new Batcher<TValue>(fn, options))

  batcher.setOptions(options)

  return batcher
}
