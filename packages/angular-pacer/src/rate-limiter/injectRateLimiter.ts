import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { shallow } from '@tanstack/angular-store'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

export interface AngularRateLimiterOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends RateLimiterOptions<TFn> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the rate limiter instance.
   */
  onUnmount?: (rateLimiter: AngularRateLimiter<TFn, TSelected>) => void
}

export interface AngularRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Pick<
  RateLimiter<TFn>,
  'maybeExecute' | 'getRemainingInWindow' | 'getMsUntilNextWindow' | 'reset'
> {
  readonly key: Signal<RateLimiter<TFn>['key']>
  readonly fn: Signal<RateLimiter<TFn>['fn']>
  readonly options: Signal<
    RateLimiter<TFn>['options'] & AngularRateLimiterOptions<TFn, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<RateLimiter<TFn>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularRateLimiterOptions<TFn, TSelected>>,
  ) => void
}

/**
 * An Angular function that creates and manages a RateLimiter instance.
 *
 * This is a lower-level function that provides direct access to the RateLimiter's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * Rate limiting is a simple "hard limit" approach that allows executions until a maximum count is reached within
 * a time window, then blocks all subsequent calls until the window resets. Unlike throttling or debouncing,
 * it does not attempt to space out or collapse executions intelligently.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * For smoother execution patterns:
 * - Use throttling when you want consistent spacing between executions (e.g. UI updates)
 * - Use debouncing when you want to collapse rapid-fire events (e.g. search input)
 * - Use rate limiting only when you need to enforce hard limits (e.g. API rate limits)
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for state management and wraps it with Angular signals.
 * The `selector` parameter allows you to specify which state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary updates when irrelevant state changes occur.
 *
 * By default, the selected state is an empty object. Provide a selector to expose
 * reactive state fields. The adapter observes core work separately for Angular stability.
 *
 * Available state properties:
 * - `executionCount`: Number of function executions that have been completed
 * - `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
 * - `rejectionCount`: Number of function executions that have been rejected due to rate limiting
 *
 * ## Cleanup on Destroy
 *
 * Use the `onUnmount` option to run a callback when the component is destroyed.
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const rateLimiter = injectRateLimiter(apiCall, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding',
 * });
 *
 * // Opt-in to track execution count changes
 * const rateLimiter = injectRateLimiter(
 *   apiCall,
 *   {
 *     limit: 5,
 *     window: 60000,
 *     windowType: 'sliding',
 *   },
 *   (state) => ({ executionCount: state.executionCount })
 * );
 *
 * // Monitor rate limit status
 * const handleClick = () => {
 *   const remaining = rateLimiter.getRemainingInWindow();
 *   if (remaining > 0) {
 *     rateLimiter.maybeExecute(data);
 *   } else {
 *     showRateLimitWarning();
 *   }
 * };
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { executionCount, rejectionCount } = rateLimiter.state();
 * ```
 */
export function injectRateLimiter<TFn extends AnyFunction, TSelected>(
  fn: TFn,
  options: AngularPacerOptions<AngularRateLimiterOptions<TFn, TSelected>>,
  selector: (state: RateLimiterState) => TSelected,
): AngularRateLimiter<TFn, TSelected>
export function injectRateLimiter<TFn extends AnyFunction>(
  fn: TFn,
  options: AngularPacerOptions<AngularRateLimiterOptions<TFn, {}>>,
  selector?: undefined,
): AngularRateLimiter<TFn, {}>
export function injectRateLimiter<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: AngularPacerOptions<AngularRateLimiterOptions<TFn, TSelected | {}>>,
  selector?: (state: RateLimiterState) => TSelected,
): AngularRateLimiter<TFn, TSelected | {}>
export function injectRateLimiter<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: AngularPacerOptions<AngularRateLimiterOptions<TFn, TSelected | {}>>,
  selector?: (state: RateLimiterState) => TSelected,
): AngularRateLimiter<TFn, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const resolvedOptions = linkedSignal<
    AngularRateLimiterOptions<TFn, TSelected | {}>
  >(() => ({
    ...defaults.rateLimiter,
    ...(typeof options === 'function' ? options() : options),
  }))
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        return new RateLimiter<TFn>(fn, initialOptions)
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  const cleanup = (current: RateLimiter<TFn>) => {
    const onUnmount = {
      ...current.options,
      ...resolvedOptions(),
    }.onUnmount
    if (onUnmount) onUnmount(result)
  }

  function run(): void
  function run<T>(operation: (current: RateLimiter<TFn>) => T): T
  function run<T>(operation?: (current: RateLimiter<TFn>) => T): T | undefined {
    return outsideZone(() =>
      untracked(() => {
        const latest = resolvedOptions()
        const current = instance()
        if (!effectOwnsInstance && !unregisterEarlyCleanup) {
          unregisterEarlyCleanup = owner.onDestroy(() =>
            outsideZone(() => untracked(() => cleanup(current))),
          )
        }
        current.setOptions(latest)
        return operation?.(current)
      }),
    )
  }

  // Read only identity here: option changes must not dispose the stable instance.
  effect((onCleanup) => {
    const current = instance()
    effectOwnsInstance = true
    unregisterEarlyCleanup?.()
    unregisterEarlyCleanup = undefined
    onCleanup(() => outsideZone(() => untracked(() => cleanup(current))))
  })

  effect(() => {
    const current = instance()
    const latest = resolvedOptions()
    outsideZone(() =>
      untracked(() => {
        current.setOptions(latest)
      }),
    )
  })

  const snapshot = injectExternalStore(() => {
    const current = instance()
    return {
      getSnapshot: () => current.store.state,
      subscribe: (notify) => {
        const { unsubscribe } = current.store.subscribe(notify)
        return unsubscribe
      },
    }
  })

  const state = computed(() => (selector ? selector(snapshot()) : {}), {
    equal: shallow,
  })

  const result: AngularRateLimiter<TFn, TSelected | {}> = {
    key: computed(() => instance().key),
    fn: computed(() => fn),
    options: computed(() => {
      const latest = resolvedOptions()
      return { ...instance().options, ...latest }
    }),
    store: computed(() => instance().store),
    state,
    setOptions: (update) =>
      untracked(() => {
        resolvedOptions.update((previous) => ({ ...previous, ...update }))
        run()
      }),
    maybeExecute: (...args) => run((current) => current.maybeExecute(...args)),
    getRemainingInWindow: (...args) =>
      run((current) => current.getRemainingInWindow(...args)),
    getMsUntilNextWindow: (...args) =>
      run((current) => current.getMsUntilNextWindow(...args)),
    reset: (...args) => run((current) => current.reset(...args)),
  }
  return result
}
