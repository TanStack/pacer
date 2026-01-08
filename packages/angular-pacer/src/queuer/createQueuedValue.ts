import { effect, signal, Signal } from '@angular/core'
import { createQueuedSignal } from './createQueuedSignal'
import type { AngularQueuer } from './createQueuer'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

/**
 * An Angular function that creates a queued value that processes state changes in order with an optional delay.
 * This function uses createQueuedSignal internally to manage a queue of state changes and apply them sequentially.
 *
 * The queued value will process changes in the order they are received, with optional delays between
 * processing each change. This is useful for handling state updates that need to be processed
 * in a specific order, like animations or sequential UI updates.
 *
 * The function returns a tuple containing:
 * - A Signal that provides the current queued value
 * - The queuer instance with control methods
 *
 * @example
 * ```ts
 * const initialValue = signal('initial');
 * const [value, queuer] = createQueuedValue(initialValue, {
 *   wait: 500,
 *   started: true
 * });
 *
 * // Add changes to the queue
 * queuer.addItem('new value');
 * ```
 */
export function createQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  initialValue: Signal<TValue>,
  options: QueuerOptions<TValue> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): [Signal<TValue>, AngularQueuer<TValue, TSelected>] {
  const value = signal<TValue>(initialValue())

  const [, addItem, queuer] = createQueuedSignal(
    (item) => {
      value.set(item)
    },
    options,
    selector,
  )

  effect(() => {
    addItem(initialValue())
  })

  return [value.asReadonly(), queuer]
}

