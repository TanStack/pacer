import { computed, effect, signal, untracked } from '@angular/core'
import { injectQueuedSignal } from './injectQueuedSignal'
import type { AngularPacerOptions } from '../types'
import type { AngularQueuer, AngularQueuerOptions } from './injectQueuer'
import type { Signal } from '@angular/core'
import type { QueuerState } from '@tanstack/pacer/queuer'

/** A processed value signal with methods for adding and controlling queued values. */
export type QueuedValueSignal<TValue, TSelected = {}> = Signal<TValue> & {
  addItem: AngularQueuer<TValue, TSelected>['addItem']
  queuer: AngularQueuer<TValue, TSelected>
}

type PrimitiveInitialValue = string | number | boolean | bigint | symbol | null

/**
 * An Angular function that creates a queued value that processes state changes in order with an optional delay.
 * This function uses injectQueuedSignal internally to manage a queue of state changes and apply them sequentially.
 *
 * The queued value will process changes in the order they are received, with optional delays between
 * processing each change. This is useful for handling state updates that need to be processed
 * in a specific order, like animations or sequential UI updates.
 *
 * The returned signal provides the most recently processed value. Before the queue processes
 * an item, it provides the explicit initial value or the source's initial value.
 * Source reads are deferred until the signal is read or Angular runs its effect, so required
 * inputs can be bound before their values are read.
 *
 * Use `queued.addItem(...)` to add a value and `queued.queuer` to control the queue.
 * Pending items are available through `queued.queuer.state().items` with the default selector.
 *
 * Pass an options object as the third argument to supply an object or function as the initial
 * value. When those options are undefined or a factory, pass a fourth selector argument
 * (undefined is allowed) to distinguish the initial-value form from options plus a selector.
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
  options?: AngularPacerOptions<AngularQueuerOptions<TValue, TSelected>>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): QueuedValueSignal<TValue, TSelected>
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  value: Signal<TValue>,
  initialValue: Extract<TValue, PrimitiveInitialValue>,
  options?: AngularQueuerOptions<TValue, TSelected>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): QueuedValueSignal<TValue, TSelected>
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  value: Signal<TValue>,
  initialValue: TValue,
  options: AngularQueuerOptions<TValue, TSelected>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): QueuedValueSignal<TValue, TSelected>
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  value: Signal<TValue>,
  initialValue: TValue,
  options:
    AngularPacerOptions<AngularQueuerOptions<TValue, TSelected>> | undefined,
  selector: ((state: QueuerState<TValue>) => TSelected) | undefined,
): QueuedValueSignal<TValue, TSelected>
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  value: Signal<TValue>,
  initialValueOrOptions?:
    TValue | AngularPacerOptions<AngularQueuerOptions<TValue, TSelected>>,
  initialOptionsOrSelector?:
    | AngularPacerOptions<AngularQueuerOptions<TValue, TSelected>>
    | ((state: QueuerState<TValue>) => TSelected),
  maybeSelector?: (state: QueuerState<TValue>) => TSelected,
): QueuedValueSignal<TValue, TSelected> {
  const hasPrimitiveInitialValue =
    initialValueOrOptions === null ||
    (initialValueOrOptions !== undefined &&
      typeof initialValueOrOptions !== 'object' &&
      typeof initialValueOrOptions !== 'function')
  const hasInitialValue =
    hasPrimitiveInitialValue ||
    (initialOptionsOrSelector !== undefined &&
      typeof initialOptionsOrSelector !== 'function') ||
    arguments.length >= 4
  const initialOptions = hasInitialValue
    ? (initialOptionsOrSelector as AngularPacerOptions<
        AngularQueuerOptions<TValue, TSelected>
      >)
    : (initialValueOrOptions as AngularPacerOptions<
        AngularQueuerOptions<TValue, TSelected>
      >)
  const selector = hasInitialValue
    ? maybeSelector
    : (initialOptionsOrSelector as
        ((state: QueuerState<TValue>) => TSelected) | undefined)

  // Wrap values so an explicit undefined remains distinct from uninitialized state.
  const processed = signal<{ value: TValue } | undefined>(
    hasInitialValue ? { value: initialValueOrOptions as TValue } : undefined,
  )
  const queuedValue = computed(() => {
    const current = processed()
    return current ? current.value : value()
  })

  const queued = injectQueuedSignal(
    (item) => {
      processed.set({ value: item })
    },
    initialOptions,
    selector,
  )

  effect(() => {
    const nextValue = value()
    untracked(() => {
      if (!processed()) processed.set({ value: nextValue })
      queued.addItem(nextValue)
    })
  })

  return Object.assign(queuedValue, {
    addItem: queued.addItem,
    queuer: queued.queuer,
  })
}
