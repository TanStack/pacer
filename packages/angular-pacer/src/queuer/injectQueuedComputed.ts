import { computed, effect, linkedSignal, untracked } from '@angular/core'
import { injectQueuer } from './injectQueuer'
import type { Signal } from '@angular/core'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { AngularQueuer, AngularQueuerOptions } from './injectQueuer'

/** A processed-value signal with its underlying queue controls. */
export interface AngularQueuerComputed<
  TValue,
  TSelected = {},
> extends Signal<TValue> {
  /** The underlying Angular Queuer ref and its selected state. */
  queuer: AngularQueuer<TValue, TSelected>
}

/**
 * Creates an Angular queued view of a source accessor.
 *
 * The first read exposes the source value. An effect enqueues the initial value and each later value it observes; processing updates the returned value in queue order. Multiple source changes before an effect runs can collapse to the latest value.
 *
 * Options accept an object or factory and follow {@link injectQueuer} behavior.
 * Pass a selector to expose reactive queue state on `queuer.state()`.
 *
 * @param source The source signal or accessor to observe.
 * @param options Core queue options or a reactive options factory.
 * @returns The processed-value signal with its queuer attached.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const source = signal('initial')
 * const value = injectQueuedComputed(source, { wait: 100 })
 * source.set('next')
 * ```
 */
export function injectQueuedComputed<TValue>(
  source: () => TValue,
  options?: MaybeAccessor<AngularQueuerOptions<TValue>>,
): AngularQueuerComputed<TValue>
/**
 * Creates the queued value signal with selected state on its attached queuer.
 * @param selector Selects reactive state exposed on the attached queuer.
 */
export function injectQueuedComputed<TValue, TSelected>(
  source: () => TValue,
  options: MaybeAccessor<AngularQueuerOptions<TValue>>,
  selector: (state: QueuerState<TValue>) => TSelected,
): AngularQueuerComputed<TValue, TSelected>
export function injectQueuedComputed<TValue, TSelected>(
  source: () => TValue,
  options: MaybeAccessor<AngularQueuerOptions<TValue>> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): AngularQueuerComputed<TValue, TSelected | {}> {
  const select = (state: QueuerState<TValue>) =>
    selector ? selector(state) : {}
  const computedSource = computed(source)
  const queuedSignal = linkedSignal(() => untracked(computedSource))
  const queuer = injectQueuer(
    (value: TValue) => queuedSignal.set(value),
    options,
    select,
  )
  effect(() => {
    queuer.addItem(computedSource())
  })
  return Object.assign(queuedSignal.asReadonly(), { queuer })
}
