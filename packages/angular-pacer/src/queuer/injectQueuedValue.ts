import { effect, linkedSignal, untracked } from '@angular/core'
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

/**
 * Queue source changes and expose the most recently processed value.
 * The source supplies the initial value lazily, after required inputs are bound.
 * Use addItem() to enqueue a value and queuer to control processing.
 */
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'>,
>(
  value: () => TValue,
  options: AngularPacerOptions<AngularQueuerOptions<TValue, TSelected>>,
  selector: (state: QueuerState<TValue>) => TSelected,
): QueuedValueSignal<TValue, TSelected>
export function injectQueuedValue<TValue>(
  value: () => TValue,
  options?: AngularPacerOptions<
    AngularQueuerOptions<TValue, Pick<QueuerState<TValue>, 'items'>>
  >,
  selector?: undefined,
): QueuedValueSignal<TValue, Pick<QueuerState<TValue>, 'items'>>
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  value: () => TValue,
  options?: AngularPacerOptions<
    AngularQueuerOptions<TValue, TSelected | Pick<QueuerState<TValue>, 'items'>>
  >,
  selector?: (state: QueuerState<TValue>) => TSelected,
): QueuedValueSignal<TValue, TSelected | Pick<QueuerState<TValue>, 'items'>>
export function injectQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  value: () => TValue,
  options?: AngularPacerOptions<
    AngularQueuerOptions<TValue, TSelected | Pick<QueuerState<TValue>, 'items'>>
  >,
  selector?: (state: QueuerState<TValue>) => TSelected,
): QueuedValueSignal<TValue, TSelected | Pick<QueuerState<TValue>, 'items'>> {
  const queuedValue = linkedSignal<TValue, TValue>({
    source: value,
    computation: (initial, previous) => (previous ? previous.value : initial),
  })
  const queued = injectQueuedSignal(
    (item) => queuedValue.set(item),
    options,
    selector,
  )

  effect(() => {
    const latest = value()
    untracked(() => queued.addItem(latest))
  })

  return Object.assign(queuedValue.asReadonly(), {
    addItem: queued.addItem,
    queuer: queued.queuer,
  })
}
