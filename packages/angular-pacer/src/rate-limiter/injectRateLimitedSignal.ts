import { linkedSignal } from '@angular/core'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectRateLimiter } from './injectRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type {
  AngularRateLimiter,
  AngularRateLimiterOptions,
} from './injectRateLimiter'
import type { Signal } from '@angular/core'

/**
 * A readonly Angular value signal with paced `set`/`update` methods.
 * The `rateLimiter` attribute exposes the underlying RateLimiter methods.
 */
export interface AngularRateLimiterSignal<
  TValue,
  TSelected = {},
> extends Signal<TValue> {
  /** Replaces the value immediately if the rate limit permits; rejected writes are discarded. */
  set: (value: TValue) => void
  /** Runs the updater with the current committed value when the write executes. */
  update: (updateFn: (previous: TValue) => TValue) => void
  /** The underlying Angular RateLimiter ref for controlling execution. */
  rateLimiter: AngularRateLimiter<(callback: () => void) => void, TSelected>
}
/**
 * Creates an Angular ratelimited editable signal.
 *
 * The initial value is available synchronously. `set` and `update` share the execution limit. Accepted writes apply immediately; rejected writes and their updater callbacks are discarded, not replayed later.
 *
 * The returned value is a real Angular signal with the underlying utility exposed
 * on `rateLimiter`. Options accept a static object or reactive factory and follow
 * {@link injectRateLimiter} lifecycle and provider behavior.
 *
 * @param initialValue The initial committed value.
 * @param options Core options or a reactive options factory.
 * @returns The value signal with `set`, `update`, and a `rateLimiter` attribute.
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
    AngularRateLimiterOptions<(callback: () => void) => void>
  >,
): AngularRateLimiterSignal<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectRateLimitedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularRateLimiterOptions<(callback: () => void) => void>
  >,
  selector: (state: RateLimiterState) => TSelected,
): AngularRateLimiterSignal<TValue, TSelected>
export function injectRateLimitedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularRateLimiterOptions<(callback: () => void) => void>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): AngularRateLimiterSignal<TValue, TSelected | {}> {
  const rateLimitedSignal = linkedSignal(toAccessorSignal(initialValue))
  const rateLimiter = injectRateLimiter(
    (callback: () => void) => callback(),
    options,
    (state) => (selector ? selector(state) : {}),
  )
  return Object.assign(rateLimitedSignal.asReadonly(), {
    set: (value: TValue) =>
      rateLimiter.maybeExecute(() => rateLimitedSignal.set(value)),
    update: (updateFn: (prev: TValue) => TValue) =>
      rateLimiter.maybeExecute(() => rateLimitedSignal.update(updateFn)),
    rateLimiter,
  })
}
