import { computed } from '@angular/core'
import { injectQueuer } from './injectQueuer'
import type { AngularQueuer } from './injectQueuer'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

export interface QueuedSignal<TValue, TSelected = {}> {
  (): Array<TValue>
  addItem: AngularQueuer<TValue, TSelected>['addItem']
  queuer: AngularQueuer<TValue, TSelected>
}

/**
 * An Angular function that creates a queuer with managed state, combining Angular's signals with queuing functionality.
 * This function provides both the current queue state and queue control methods.
 *
 * The queue state is automatically updated whenever items are added, removed, or reordered in the queue.
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
 * const queued = injectQueuedSignal(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 }
 * );
 *
 * // Add items
 * queued.addItem('task1');
 *
 * // Access items
 * console.log(queued()); // ['task1']
 *
 * // Control the queue
 * queued.queuer.start();
 * queued.queuer.stop();
 * ```
 */
export function injectQueuedSignal<
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
): QueuedSignal<TValue, TSelected> {
  const queuer = injectQueuer(fn, options, selector)

  const items = computed(() => queuer.state().items as Array<TValue>)

  const queued = Object.assign(items, {
    addItem: queuer.addItem.bind(queuer),
    queuer,
  }) as QueuedSignal<TValue, TSelected>

  return queued
}
