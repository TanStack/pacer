import { computed, Signal } from '@angular/core'
import { createQueuer } from './createQueuer'
import type { AngularQueuer } from './createQueuer'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

/**
 * An Angular function that creates a queuer with managed state, combining Angular's signals with queuing functionality.
 * This function provides both the current queue state and queue control methods.
 *
 * The queue state is automatically updated whenever items are added, removed, or reordered in the queue.
 * All queue operations are reflected in the state array returned by the function.
 *
 * The function returns a tuple containing:
 * - A Signal that provides the current queue items as an array
 * - The queuer's addItem method
 * - The queuer instance with additional control methods
 *
 * @example
 * ```ts
 * // Default behavior - track items
 * const [items, addItem, queue] = createQueuedSignal(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 }
 * );
 *
 * // Add items
 * addItem('task1');
 *
 * // Access items
 * console.log(items()); // ['task1']
 *
 * // Control the queue
 * queue.start();
 * queue.stop();
 * ```
 */
export function createQueuedSignal<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  fn: (item: TValue) => void,
  options: QueuerOptions<TValue> = {},
  selector: (state: QueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  Signal<Array<TValue>>,
  AngularQueuer<TValue, TSelected>['addItem'],
  AngularQueuer<TValue, TSelected>,
] {
  const queue = createQueuer(fn, options, selector)

  const items = computed(() => queue.state().items as Array<TValue>)

  return [items, queue.addItem.bind(queue), queue]
}
