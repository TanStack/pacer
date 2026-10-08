import { linkedSignal } from '@angular/core'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectQueuer } from './injectQueuer'
import type { Signal } from '@angular/core'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { AngularQueuer, AngularQueuerOptions } from './injectQueuer'

/** A processed-value signal with its underlying queue controls. */
export interface AngularQueuerSignal<
  TValue,
  TSelected = {},
> extends Signal<TValue> {
  /** Enqueues a replacement value. */
  set: (value: TValue) => void
  /** Enqueues an updater evaluated against the committed value when processed. */
  update: (updater: (previous: TValue) => TValue) => void
  /** The underlying Angular Queuer ref and its selected state. */
  queuer: AngularQueuer<() => void, TSelected>
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
 * @returns The processed-value signal with its queuer attached.
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
  options?: MaybeAccessor<AngularQueuerOptions<() => void>>,
): AngularQueuerSignal<TValue>
/**
 * Creates the queued value signal with selected state on its attached queuer.
 * @param selector Selects reactive state exposed on the attached queuer.
 */
export function injectQueuedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<AngularQueuerOptions<() => void>>,
  selector: (state: QueuerState<() => void>) => TSelected,
): AngularQueuerSignal<TValue, TSelected>
export function injectQueuedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<AngularQueuerOptions<() => void>> = {},
  selector?: (state: QueuerState<() => void>) => TSelected,
): AngularQueuerSignal<TValue, TSelected | {}> {
  const queuedSignal = linkedSignal(toAccessorSignal(initialValue))
  const queuer = injectQueuer(
    (callback: () => void) => callback(),
    options,
    (state) => (selector ? selector(state) : {}),
  )
  return Object.assign(queuedSignal.asReadonly(), {
    set: (value: TValue) => queuer.addItem(() => queuedSignal.set(value)),
    update: (updater: (previous: TValue) => TValue) =>
      queuer.addItem(() => queuedSignal.update(updater)),
    queuer,
  })
}
