import { Queuer } from '@tanstack/pacer/queuer'
import { useStore } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

export interface SolidQueuer<TValue, TSelected = QueuerState<TValue>>
  extends Omit<Queuer<TValue>, 'store'> {
  /**
   * Reactive state that will be updated when the queuer state changes
   *
   * Use this instead of `queuer.store.state`
   */
  readonly state: Accessor<TSelected>
}

/**
 * Creates a Solid-compatible Queuer instance for managing a synchronous queue of items, exposing Solid signals for all stateful properties.
 *
 * Features:
 * - Synchronous processing of items using the provided `fn` function
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Priority queueing via `getPriority` or item `priority` property
 * - Item expiration and removal of stale items
 * - Configurable wait time between processing items
 * - Pause/resume processing
 * - Callbacks for queue state changes, execution, rejection, and expiration
 * - All stateful properties (items, counts, etc.) are exposed as Solid signals for reactivity
 *
 * The queue processes items synchronously in order, with optional delays between each item. When started, it will process one item per tick, with an optional wait time between ticks. You can pause and resume processing with `stop()` and `start()`.
 *
 * By default, the queue uses FIFO behavior, but you can configure LIFO or double-ended queueing by specifying the position when adding or removing items.
 *
 * Example usage:
 * ```tsx
 * // Example with Solid signals and scheduling
 * const [items, setItems] = createSignal([]);
 *
 * const queue = createQueuer(
 *   (item) => {
 *     // process item synchronously
 *     console.log('Processing', item);
 *   },
 *   {
 *     started: true, // Start processing immediately
 *     wait: 1000,    // Process one item every second
 *     onItemsChange: (queue) => setItems(queue.peekAllItems()),
 *     getPriority: (item) => item.priority // Process higher priority items first
 *   }
 * );
 *
 * // Add items to process - they'll be handled automatically
 * queue.addItem('task1');
 * queue.addItem('task2');
 *
 * // Control the scheduler
 * queue.stop();  // Pause processing
 * queue.start(); // Resume processing
 *
 * // Access queue state via signals
 * console.log('Items:', queue.allItems());
 * console.log('Size:', queue.size());
 * console.log('Is empty:', queue.isEmpty());
 * console.log('Is running:', queue.isRunning());
 * console.log('Next item:', queue.nextItem());
 * ```
 */
export function createQueuer<TValue, TSelected = QueuerState<TValue>>(
  fn: (item: TValue) => void,
  initialOptions: QueuerOptions<TValue> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): SolidQueuer<TValue, TSelected> {
  const queuer = new Queuer(fn, initialOptions)

  const state = useStore(queuer.store, selector)

  return {
    ...queuer,
    state,
  } as unknown as SolidQueuer<TValue, TSelected> // omit `store` in favor of `state`
}
