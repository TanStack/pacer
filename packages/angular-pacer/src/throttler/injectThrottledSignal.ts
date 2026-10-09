import { linkedSignal } from '@angular/core'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectThrottler } from './injectThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type {
  AngularThrottler,
  AngularThrottlerOptions,
} from './injectThrottler'
import type { Signal } from '@angular/core'

/**
 * A readonly Angular value signal with paced `set`/`update` methods.
 * The `throttler` attribute exposes the underlying Throttler methods.
 */
export interface AngularThrottlerSignal<
  TValue,
  TSelected = {},
> extends Signal<TValue> {
  /** Schedules the replacement value according to leading and trailing throttling options. */
  set: (value: TValue) => void
  /** Runs the updater with the current committed value when the write executes. */
  update: (updateFn: (previous: TValue) => TValue) => void
  /** The underlying Angular Throttler ref for controlling execution. */
  throttler: AngularThrottler<(callback: () => void) => void, TSelected>
}
/**
 * Creates an Angular throttled editable signal.
 *
 * The initial value is available synchronously. `set` and `update` share a throttler. Leading writes may apply immediately; subsequent writes replace the pending trailing write without extending its deadline. An updater runs against the committed value when executed.
 *
 * The returned value is a real Angular signal with the underlying utility exposed
 * on `throttler`. Options accept a static object or reactive factory and follow
 * {@link injectThrottler} lifecycle and provider behavior.
 *
 * @param initialValue The initial committed value.
 * @param options Core options or a reactive options factory.
 * @returns The value signal with `set`, `update`, and a `throttler` attribute.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const value = injectThrottledSignal(0, { wait: 250 })
 * value.set(10)
 * value.update(previous => previous + 1)
 * console.log(value())
 * ```
 */
export function injectThrottledSignal<TValue>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularThrottlerOptions<(callback: () => void) => void>
  >,
): AngularThrottlerSignal<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectThrottledSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularThrottlerOptions<(callback: () => void) => void>
  >,
  selector: (
    state: ThrottlerState<(callback: () => void) => void>,
  ) => TSelected,
): AngularThrottlerSignal<TValue, TSelected>
export function injectThrottledSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularThrottlerOptions<(callback: () => void) => void>
  >,
  selector?: (
    state: ThrottlerState<(callback: () => void) => void>,
  ) => TSelected,
): AngularThrottlerSignal<TValue, TSelected | {}> {
  const throttledSignal = linkedSignal(toAccessorSignal(initialValue))
  const throttler = injectThrottler(
    (callback: () => void) => callback(),
    options,
    (state) => (selector ? selector(state) : {}),
  )
  return Object.assign(throttledSignal.asReadonly(), {
    set: (value: TValue) =>
      throttler.maybeExecute(() => throttledSignal.set(value)),
    update: (updateFn: (prev: TValue) => TValue) =>
      throttler.maybeExecute(() => throttledSignal.update(updateFn)),
    throttler,
  })
}
