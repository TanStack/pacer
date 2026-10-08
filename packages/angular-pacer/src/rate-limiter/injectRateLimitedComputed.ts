import { effect, linkedSignal, untracked } from '@angular/core'
import { injectRateLimiter } from './injectRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type {
  AngularRateLimiter,
  AngularRateLimiterOptions,
} from './injectRateLimiter'
import type { Signal } from '@angular/core'

/**
 * A readonly Angular value signal with its underlying utility ref.
 * The `rateLimiter` attribute exposes the underlying RateLimiter methods.
 */
export interface AngularRateLimiterComputed<
  TValue,
  TSelected = {},
> extends Signal<TValue> {
  /** The underlying Angular RateLimiter ref for controlling execution. */
  rateLimiter: AngularRateLimiter<(value: TValue) => void, TSelected>
}
/**
 * Creates an Angular ratelimited view of a source signal.
 *
 * The initial source value is available on first read. An effect passes source values to the rate limiter, including the initial value. Excess updates are discarded; the end of a window does not replay rejected values.
 *
 * The returned value is a real Angular signal with the underlying utility exposed
 * on `rateLimiter`. Options accept a static object or reactive factory and follow
 * {@link injectRateLimiter} lifecycle and provider behavior.
 *
 * @param source The source signal or accessor whose changes are observed.
 * @param options Core options or a reactive options factory.
 * @returns The value signal with a `rateLimiter` attribute.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const source = signal('initial')
 * const value = injectRateLimitedComputed(source, { limit: 5, window: 1000 })
 * source.set('updated')
 * console.log(value())
 * ```
 */
export function injectRateLimitedComputed<TValue>(
  source: () => TValue,
  options: MaybeAccessor<AngularRateLimiterOptions<(value: TValue) => void>>,
): AngularRateLimiterComputed<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectRateLimitedComputed<TValue, TSelected>(
  source: () => TValue,
  options: MaybeAccessor<AngularRateLimiterOptions<(value: TValue) => void>>,
  selector: (state: RateLimiterState) => TSelected,
): AngularRateLimiterComputed<TValue, TSelected>
export function injectRateLimitedComputed<TValue, TSelected>(
  source: () => TValue,
  options: MaybeAccessor<AngularRateLimiterOptions<(value: TValue) => void>>,
  selector?: (state: RateLimiterState) => TSelected,
): AngularRateLimiterComputed<TValue, TSelected | {}> {
  const select = (state: RateLimiterState) => (selector ? selector(state) : {})
  const rateLimitedSignal = linkedSignal(() => untracked(source))
  const rateLimiter = injectRateLimiter(
    (value: TValue) => rateLimitedSignal.set(value),
    options,
    select,
  )
  effect(() => {
    rateLimiter.maybeExecute(source())
  })
  return Object.assign(rateLimitedSignal.asReadonly(), {
    rateLimiter,
  })
}
