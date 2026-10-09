import { effect, linkedSignal, untracked } from '@angular/core'
import { injectThrottler } from './injectThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type {
  AngularThrottler,
  AngularThrottlerOptions,
} from './injectThrottler'
import type { Signal } from '@angular/core'

/**
 * A readonly Angular value signal with its underlying utility ref.
 * The `throttler` attribute exposes the underlying Throttler methods.
 */
export interface AngularThrottlerComputed<
  TValue,
  TSelected = {},
> extends Signal<TValue> {
  /** The underlying Angular Throttler ref for controlling execution. */
  throttler: AngularThrottler<(value: TValue) => void, TSelected>
}
/**
 * Creates an Angular throttled view of a source signal.
 *
 * The initial source value is available on first read. An effect passes source values to the throttler, including the initial value. Later changes replace the pending trailing value without restarting the interval.
 *
 * The returned value is a real Angular signal with the underlying utility exposed
 * on `throttler`. Options accept a static object or reactive factory and follow
 * {@link injectThrottler} lifecycle and provider behavior.
 *
 * @param source The source signal or accessor whose changes are observed.
 * @param options Core options or a reactive options factory.
 * @returns The value signal with a `throttler` attribute.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const source = signal('initial')
 * const value = injectThrottledComputed(source, { wait: 250 })
 * source.set('updated')
 * console.log(value())
 * ```
 */
export function injectThrottledComputed<TValue>(
  source: () => TValue,
  options: MaybeAccessor<AngularThrottlerOptions<(value: TValue) => void>>,
): AngularThrottlerComputed<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectThrottledComputed<TValue, TSelected>(
  source: () => TValue,
  options: MaybeAccessor<AngularThrottlerOptions<(value: TValue) => void>>,
  selector: (state: ThrottlerState<(value: TValue) => void>) => TSelected,
): AngularThrottlerComputed<TValue, TSelected>
export function injectThrottledComputed<TValue, TSelected>(
  source: () => TValue,
  options: MaybeAccessor<AngularThrottlerOptions<(value: TValue) => void>>,
  selector?: (state: ThrottlerState<(value: TValue) => void>) => TSelected,
): AngularThrottlerComputed<TValue, TSelected | {}> {
  const select = (state: ThrottlerState<(value: TValue) => void>) =>
    selector ? selector(state) : {}
  const throttledSignal = linkedSignal(() => untracked(source))
  const throttler = injectThrottler(
    (value: TValue) => throttledSignal.set(value),
    options,
    select,
  )
  effect(() => {
    throttler.maybeExecute(source())
  })
  return Object.assign(throttledSignal.asReadonly(), {
    throttler,
  })
}
