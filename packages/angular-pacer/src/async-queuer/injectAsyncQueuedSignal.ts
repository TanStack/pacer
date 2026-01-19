import { computed } from '@angular/core'
import { injectAsyncQueuer } from './injectAsyncQueuer'
import type { AngularAsyncQueuer } from './injectAsyncQueuer'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

export type AsyncQueuedSignal<
  TValue,
  TSelected = {},
> = (() => Array<TValue>) & {
  /**
   * Add an item to the queue.
   */
  readonly addItem: AngularAsyncQueuer<TValue, TSelected>['addItem']
  /**
   * The queuer instance with additional control methods and state signals.
   */
  readonly queuer: AngularAsyncQueuer<TValue, TSelected>
}

/**
 * An Angular function that creates an async queuer with managed state, combining Angular's signals with async queuing functionality.
 * This function provides both the current queue state and queue control methods.
 *
 * The queue state is automatically updated whenever items are added, removed, or processed in the queue.
 * All queue operations are reflected in the state array returned by the function.
 *
 * The function returns a callable object:
 * - `queued()`: Get the current queue items as an array
 * - `queued.addItem(...)`: Add an item to the queue
 * - `queued.queue`: The queuer instance with additional control methods
 *
 * @example
 * ```ts
 * // Default behavior - track items
 * const queued = injectAsyncQueuedSignal(
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
 * queued.addItem(data1);
 *
 * // Access items
 * console.log(queued()); // [data1, ...]
 *
 * // Control the queue
 * queued.queuer.start();
 * queued.queuer.stop();
 * ```
 */
export function injectAsyncQueuedSignal<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
>(
  fn: (value: TValue) => Promise<any>,
  options: AsyncQueuerOptions<TValue> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): AsyncQueuedSignal<TValue, TSelected> {
  const queuer = injectAsyncQueuer(fn, options, selector)

  const items = computed(() => queuer.state().items as Array<TValue>)

  const queued = Object.assign(items, {
    addItem: queuer.addItem.bind(queuer),
    queuer,
  }) as AsyncQueuedSignal<TValue, TSelected>

  return queued
}
