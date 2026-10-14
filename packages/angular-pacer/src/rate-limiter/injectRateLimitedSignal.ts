import {
  assertInInjectionContext,
  linkedSignal,
  untracked,
} from '@angular/core'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectRateLimiter } from './injectRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { SignalWrite } from '../utils/internalTypes'
import type {
  AngularRateLimiter,
  AngularRateLimiterOptions,
} from './injectRateLimiter'
import type { WritableSignal } from '@angular/core'

/**
 * An Angular writable signal whose `set` and `update` writes share a rate limit.
 * Accepted writes execute immediately; rejected writes and their updaters are
 * discarded. Updaters receive the committed value when executed. `asReadonly()`
 * exposes a live readonly view. The `rateLimiter` attribute controls execution.
 */
export interface AngularRateLimiterSignal<
  TValue,
  TSelected = {},
> extends WritableSignal<TValue> {
  /** The underlying Angular RateLimiter ref for controlling execution. */
  rateLimiter: AngularRateLimiter<
    (value: SignalWrite<TValue>) => void,
    TSelected
  >
}
/**
 * Creates an Angular ratelimited editable signal.
 *
 * The initial value is available synchronously. `set` and `update` share the execution limit. Accepted writes apply immediately; rejected writes and their updater callbacks are discarded, not replayed later.
 *
 * The returned value is a real Angular writable signal with the underlying utility exposed
 * on `rateLimiter`. Options accept a static object or reactive factory and follow
 * {@link injectRateLimiter} lifecycle and provider behavior.
 *
 * @param initialValue The initial committed value.
 * @param options Core options or a reactive options factory.
 * @returns The writable signal with `set`, `update`, `asReadonly`, and a `rateLimiter` attribute.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const value = injectRateLimitedSignal(0, { limit: 5, window: 1000 })
 * value.set(10)
 * value.update(previous => previous + 1)
 * console.log(value())
 * ```
 */
export function injectRateLimitedSignal<TValue>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularRateLimiterOptions<(value: SignalWrite<TValue>) => void>
  >,
): AngularRateLimiterSignal<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectRateLimitedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularRateLimiterOptions<(value: SignalWrite<TValue>) => void>
  >,
  selector: (state: RateLimiterState) => TSelected,
): AngularRateLimiterSignal<TValue, TSelected>
export function injectRateLimitedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularRateLimiterOptions<(value: SignalWrite<TValue>) => void>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): AngularRateLimiterSignal<TValue, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectRateLimitedSignal)
  }

  const initialValueSignal = toAccessorSignal(initialValue)
  const rateLimitedSignal = linkedSignal(() => untracked(initialValueSignal))
  const commitValue = rateLimitedSignal.set
  const rateLimiter = injectRateLimiter(
    (value: SignalWrite<TValue>) => {
      commitValue(
        typeof value === 'function'
          ? (value as (previous: TValue) => TValue)(rateLimitedSignal())
          : value,
      )
    },
    options,
    (state) => (selector ? selector(state) : {}),
  )
  return Object.assign(rateLimitedSignal, {
    set: (value: TValue) =>
      rateLimiter.maybeExecute(
        (typeof value === 'function'
          ? () => value
          : value) as SignalWrite<TValue>,
      ),
    update: (updateFn: (prev: TValue) => TValue) =>
      rateLimiter.maybeExecute(updateFn),
    rateLimiter,
  })
}
