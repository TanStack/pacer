import { effect, linkedSignal, signal } from '@angular/core'
import { injectQueuedSignal } from './injectQueuedSignal'
import type { QueuedSignal } from './injectQueuedSignal'
import type { Signal } from '@angular/core'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

/**
 * An Angular function that creates a queued value that processes state changes in order with an optional delay.
 * This function uses injectQueuedSignal internally to manage a queue of state changes and apply them sequentially.
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
 * const initialValue = signal('initial')
 * const queued = injectQueuedValue(initialValue, {
 *   wait: 500,
 *   started: true,
 * })
 *
 * // Add changes to the queue
 * queued.addItem('new value')
 * ```
 */
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  value: Signal<TValue>,
  options?: QueuerOptions<TValue>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): QueuedSignal<TValue, TSelected>
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  value: Signal<TValue>,
  initialValue: TValue,
  options?: QueuerOptions<TValue>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): QueuedSignal<TValue, TSelected>
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  value: Signal<TValue>,
  initialValueOrOptions?: TValue | QueuerOptions<TValue>,
  initialOptionsOrSelector?:
    | QueuerOptions<TValue>
    | ((state: QueuerState<TValue>) => TSelected),
  maybeSelector?: (state: QueuerState<TValue>) => TSelected,
): QueuedSignal<TValue, TSelected> {
  const hasSelector = typeof initialOptionsOrSelector === 'function'
  const hasInitialValue =
    (initialOptionsOrSelector !== undefined && !hasSelector) ||
    maybeSelector !== undefined

  const initialValue = hasInitialValue
    ? (initialValueOrOptions as TValue)
    : value()
  const initialOptions = hasInitialValue
    ? (initialOptionsOrSelector as QueuerOptions<TValue>)
    : (initialValueOrOptions as QueuerOptions<TValue>)
  const selector = hasInitialValue
    ? maybeSelector
    : (initialOptionsOrSelector as
        | ((state: QueuerState<TValue>) => TSelected)
        | undefined)

  const linkedValue = linkedSignal(() => value())
  const queuedValue = signal<TValue>(initialValue)

  const queued = injectQueuedSignal(
    (item) => {
      queuedValue.set(item)
    },
    initialOptions,
    selector,
  )

  effect(() => {
    queued.addItem(linkedValue())
  })

  return queued
}
