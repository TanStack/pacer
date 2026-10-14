import {
  assertInInjectionContext,
  linkedSignal,
  untracked,
} from '@angular/core'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectQueuer } from './injectQueuer'
import type { WritableSignal } from '@angular/core'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { SignalWrite } from '../utils/internalTypes'
import type { AngularQueuer, AngularQueuerOptions } from './injectQueuer'

/**
 * An Angular writable signal whose `set` and `update` writes are queued in order.
 * Updaters receive the committed value when their queue item executes.
 * `asReadonly()` exposes a live readonly view. The `queuer` attribute controls
 * processing and exposes selected queue state.
 */
export interface AngularQueuerSignal<
  TValue,
  TSelected = {},
> extends WritableSignal<TValue> {
  /** The underlying Angular Queuer ref and its selected state. */
  queuer: AngularQueuer<SignalWrite<TValue>, TSelected>
}

/**
 * Creates an Angular queued editable signal.
 *
 * Every set and update is queued and processed in order. Updaters run against the committed value when their queue item executes.
 *
 * Options accept an object or factory and follow {@link injectQueuer} behavior.
 * Pass a selector to expose reactive queue state on `queuer.state()`.
 *
 * @param initialValue The initial committed value.
 * @param options Core queue options or a reactive options factory.
 * @returns The writable processed-value signal with its queuer attached.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const value = injectQueuedSignal(0, { wait: 100 })
 * value.set(1)
 * value.update(previous => previous + 1)
 * ```
 */
export function injectQueuedSignal<TValue>(
  initialValue: MaybeAccessor<TValue>,
  options?: MaybeAccessor<AngularQueuerOptions<SignalWrite<TValue>>>,
): AngularQueuerSignal<TValue>
/**
 * Creates the queued value signal with selected state on its attached queuer.
 * @param selector Selects reactive state exposed on the attached queuer.
 */
export function injectQueuedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<AngularQueuerOptions<SignalWrite<TValue>>>,
  selector: (state: QueuerState<SignalWrite<TValue>>) => TSelected,
): AngularQueuerSignal<TValue, TSelected>
export function injectQueuedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<AngularQueuerOptions<SignalWrite<TValue>>> = {},
  selector?: (state: QueuerState<SignalWrite<TValue>>) => TSelected,
): AngularQueuerSignal<TValue, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectQueuedSignal)
  }

  const initialValueSignal = toAccessorSignal(initialValue)
  const queuedSignal = linkedSignal(() => untracked(initialValueSignal))
  const commitValue = queuedSignal.set
  const queuer = injectQueuer(
    (value: SignalWrite<TValue>) => {
      commitValue(
        typeof value === 'function'
          ? (value as (previous: TValue) => TValue)(queuedSignal())
          : value,
      )
    },
    options,
    (state) => (selector ? selector(state) : {}),
  )
  return Object.assign(queuedSignal, {
    set: (value: TValue) =>
      queuer.addItem(
        (typeof value === 'function'
          ? () => value
          : value) as SignalWrite<TValue>,
      ),
    update: (updater: (previous: TValue) => TValue) => queuer.addItem(updater),
    queuer,
  })
}
