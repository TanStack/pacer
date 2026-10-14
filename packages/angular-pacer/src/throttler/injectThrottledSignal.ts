import {
  assertInInjectionContext,
  linkedSignal,
  untracked,
} from '@angular/core'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectThrottler } from './injectThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { SignalWrite } from '../utils/internalTypes'
import type {
  AngularThrottler,
  AngularThrottlerOptions,
} from './injectThrottler'
import type { WritableSignal } from '@angular/core'

/**
 * An Angular writable signal whose `set` and `update` writes are throttled.
 * Leading writes may execute immediately; later writes replace the pending
 * trailing write without extending its deadline. Updaters receive the committed
 * value when executed. `asReadonly()` exposes a live readonly view.
 * The `throttler` attribute controls execution.
 */
export interface AngularThrottlerSignal<
  TValue,
  TSelected = {},
> extends WritableSignal<TValue> {
  /** The underlying Angular Throttler ref for controlling execution. */
  throttler: AngularThrottler<(value: SignalWrite<TValue>) => void, TSelected>
}
/**
 * Creates an Angular throttled editable signal.
 *
 * The initial value is available synchronously. `set` and `update` share a throttler. Leading writes may apply immediately; subsequent writes replace the pending trailing write without extending its deadline. An updater runs against the committed value when executed.
 *
 * The returned value is a real Angular writable signal with the underlying utility exposed
 * on `throttler`. Options accept a static object or reactive factory and follow
 * {@link injectThrottler} lifecycle and provider behavior.
 *
 * @param initialValue The initial committed value.
 * @param options Core options or a reactive options factory.
 * @returns The writable signal with `set`, `update`, `asReadonly`, and a `throttler` attribute.
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
    AngularThrottlerOptions<(value: SignalWrite<TValue>) => void>
  >,
): AngularThrottlerSignal<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectThrottledSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularThrottlerOptions<(value: SignalWrite<TValue>) => void>
  >,
  selector: (
    state: ThrottlerState<(value: SignalWrite<TValue>) => void>,
  ) => TSelected,
): AngularThrottlerSignal<TValue, TSelected>
export function injectThrottledSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularThrottlerOptions<(value: SignalWrite<TValue>) => void>
  >,
  selector?: (
    state: ThrottlerState<(value: SignalWrite<TValue>) => void>,
  ) => TSelected,
): AngularThrottlerSignal<TValue, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectThrottledSignal)
  }

  const initialValueSignal = toAccessorSignal(initialValue)
  const throttledSignal = linkedSignal(() => untracked(initialValueSignal))
  const commitValue = throttledSignal.set
  const throttler = injectThrottler(
    (value: SignalWrite<TValue>) => {
      commitValue(
        typeof value === 'function'
          ? (value as (previous: TValue) => TValue)(throttledSignal())
          : value,
      )
    },
    options,
    (state) => (selector ? selector(state) : {}),
  )
  return Object.assign(throttledSignal, {
    set: (value: TValue) =>
      throttler.maybeExecute(
        (typeof value === 'function'
          ? () => value
          : value) as SignalWrite<TValue>,
      ),
    update: (updateFn: (prev: TValue) => TValue) =>
      throttler.maybeExecute(updateFn),
    throttler,
  })
}
