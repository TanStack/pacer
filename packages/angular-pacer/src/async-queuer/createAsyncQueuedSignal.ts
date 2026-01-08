import { computed, Signal } from '@angular/core'
import { createAsyncQueuer } from './createAsyncQueuer'
import type { AngularAsyncQueuer } from './createAsyncQueuer'
import type { AsyncQueuerOptions, AsyncQueuerState } from '@tanstack/pacer/async-queuer'

/**
 * An Angular function that creates an async queuer with managed state, combining Angular's signals with async queuing functionality.
 * This function provides both the current queue state and queue control methods.
 *
 * The queue state is automatically updated whenever items are added, removed, or processed in the queue.
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
 * const [items, addItem, queuer] = createAsyncQueuedSignal(
 *   async (item) => {
 *     const response = await fetch('/api/process', {
 *       method: 'POST',
 *       body: JSON.stringify(item)
 *     });
 *     return response.json();
 *   },
 *   { concurrency: 2, wait: 1000 }
 * );
 *
 * // Add items
 * addItem(data1);
 *
 * // Access items
 * console.log(items()); // [data1, ...]
 *
 * // Control the queue
 * queuer.start();
 * queuer.stop();
 * ```
 */
export function createAsyncQueuedSignal<TValue, TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
  AsyncQueuerState<TValue>,
  'items'
>>(
  fn: (value: TValue) => Promise<any>,
  options: AsyncQueuerOptions<TValue> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  Signal<Array<TValue>>,
  AngularAsyncQueuer<TValue, TSelected>['addItem'],
  AngularAsyncQueuer<TValue, TSelected>,
] {
  const queuer = createAsyncQueuer(fn, options, selector)

  const items = computed(() => queuer.state().items as Array<TValue>)

  return [items, queuer.addItem.bind(queuer), queuer]
}

