import {
  assertInInjectionContext,
  computed,
  effect,
  untracked,
} from '@angular/core'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { shallow } from '@tanstack/store'
import { injectPacerOptions } from '../provider/providePacerOptions'
import { toAccessorSignal } from '../utils/maybeAccessor'
import {
  injectForwardMethods,
  methodNames,
} from '../utils/injectForwardMethods'
import { injectLazy } from '../utils/injectLazy'
import { injectInsideZone } from '../utils/zoneCompatibility'
import { injectSelector } from '../utils/injectSelector'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { MethodMap } from '../utils/injectForwardMethods'
import type { ReadonlySelected } from '../utils/internalTypes'
import type { Signal } from '@angular/core'
import type {
  AnyFunction,
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer'

/**
 * Options for {@link injectRateLimiter}, including core configuration and Angular cleanup.
 */
export interface AngularRateLimiterOptions<
  TFn extends AnyFunction,
> extends RateLimiterOptions<TFn> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * There is no default cleanup; use this callback for custom teardown.
   */
  onUnmount?: (core: RateLimiter<TFn>) => void
}

const rateLimiterMethodMap = {
  fn: false,
  setOptions: false,
  maybeExecute: true,
  getRemainingInWindow: true,
  getMsUntilNextWindow: true,
  reset: true,
} satisfies MethodMap<RateLimiter<AnyFunction>>

const rateLimiterMethods = methodNames(rateLimiterMethodMap)

type RateLimiterMethod = (typeof rateLimiterMethods)[number]

/**
 * An Angular RateLimiter ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Pick<RateLimiter<TFn>, RateLimiterMethod> {
  /** The readonly selector result. Returns an empty object when no selector is supplied. */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular RateLimiter in the current injection context.
 *
 * Allows calls up to the configured limit within a fixed or sliding window. Calls beyond the limit are rejected rather than queued.
 *
 * ## Options and state
 *
 * Accepts static options or an options factory. Factories are read lazily, and signal
 * dependencies update the existing core instance. Local options override provider defaults.
 * Methods apply current options before executing and schedule work outside Angular's zone. The provided function runs inside Angular's zone.
 *
 * Pass a selector to expose reactive core state through `state()`. Without a selector,
 * `state()` returns `{}`; operations remain available on the ref.
 *
 * ## Cleanup
 *
 * There is no default cleanup. Set `onUnmount` to customize cleanup.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectRateLimiter(
 *   (query: string) => console.log(query),
 *   () => ({ limit: 5, window: 1000 }),
 *   (state) => state.executionCount,
 * )
 * utility.maybeExecute('search')
 * console.log(utility.state())
 * ```
 */
export function injectRateLimiter<TFn extends AnyFunction>(
  fn: TFn,
  options: MaybeAccessor<AngularRateLimiterOptions<TFn>>,
): AngularRateLimiter<TFn>
/**
 * Creates an Angular RateLimiter with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectRateLimiter<TFn extends AnyFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularRateLimiterOptions<TFn>>,
  selector: (state: RateLimiterState) => TSelected,
): AngularRateLimiter<TFn, TSelected>
export function injectRateLimiter<TFn extends AnyFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularRateLimiterOptions<TFn>>,
  selector: (state: RateLimiterState) => TSelected | {} = () => ({}),
): AngularRateLimiter<TFn, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectRateLimiter)
  }

  const runFn = injectInsideZone(fn)
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed<AngularRateLimiterOptions<TFn>>(() => ({
    ...baseOptions.rateLimiter,
    ...optionsSignal(),
  }))

  const getRateLimiter = injectLazy(
    () => new RateLimiter<TFn>(runFn, mergedOptions()),
    (core) => {
      const opts = mergedOptions()
      if (opts.onUnmount) {
        opts.onUnmount(core)
      }
    },
  )

  const methods = injectForwardMethods(
    getRateLimiter,
    rateLimiterMethods,
    (core) => {
      core.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => getRateLimiter().setOptions(opts))
  })

  const state = injectSelector(() => getRateLimiter().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
