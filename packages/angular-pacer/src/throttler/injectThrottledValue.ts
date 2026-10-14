import {
  assertInInjectionContext,
  computed,
  effect,
  linkedSignal,
  untracked,
} from '@angular/core'
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
export interface AngularThrottlerValue<
  TValue,
  TSelected = {},
> extends Signal<TValue> {
  /** The underlying Angular Throttler ref for controlling execution. */
  throttler: AngularThrottler<(value: TValue) => void, TSelected>
}
/**
 * Creates an Angular throttled view of a source signal.
 *
 * The initial source value is available on first read. The unchanged initial value does not enter the throttler. An effect passes subsequent source changes to the throttler; later changes replace the pending trailing value without restarting the interval.
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
 * const value = injectThrottledValue(source, { wait: 250 })
 * source.set('updated')
 * console.log(value())
 * ```
 */
export function injectThrottledValue<TValue>(
  source: () => TValue,
  options: MaybeAccessor<AngularThrottlerOptions<(value: TValue) => void>>,
): AngularThrottlerValue<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectThrottledValue<TValue, TSelected>(
  source: () => TValue,
  options: MaybeAccessor<AngularThrottlerOptions<(value: TValue) => void>>,
  selector: (state: ThrottlerState<(value: TValue) => void>) => TSelected,
): AngularThrottlerValue<TValue, TSelected>
export function injectThrottledValue<TValue, TSelected>(
  source: () => TValue,
  options: MaybeAccessor<AngularThrottlerOptions<(value: TValue) => void>>,
  selector?: (state: ThrottlerState<(value: TValue) => void>) => TSelected,
): AngularThrottlerValue<TValue, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectThrottledValue)
  }

  const select = (state: ThrottlerState<(value: TValue) => void>) =>
    selector ? selector(state) : {}
  const sourceValue = computed(source)
  const throttledSignal = linkedSignal(() => untracked(sourceValue))
  const throttler = injectThrottler(
    (value: TValue) => throttledSignal.set(value),
    options,
    select,
  )
  let initialized = false
  effect(() => {
    const value = sourceValue()
    if (!initialized) {
      initialized = true
      if (Object.is(untracked(throttledSignal), value)) return
    }
    throttler.maybeExecute(value)
  })
  return Object.assign(throttledSignal.asReadonly(), {
    throttler,
  })
}
