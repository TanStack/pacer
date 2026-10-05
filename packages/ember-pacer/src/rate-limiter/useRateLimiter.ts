import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createSubscribe } from '../utils/Subscribe'
import { select } from '../utils/select'
import type { EmberPacerSubscribe } from '../utils/Subscribe'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

/** Options for useRateLimiter, including owner cleanup. */
export interface EmberRateLimiterOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends RateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberRateLimiter<TFn, TSelected>) => void
}

/** A RateLimiter with framework-reactive selected state. All core methods remain available. */
export interface EmberRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<RateLimiter<TFn>, 'options' | 'setOptions'> {
  options: RateLimiter<TFn>['options'] & EmberRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<EmberRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: EmberPacerSubscribe<RateLimiterState>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the RateLimiter for its Ember owner.
 *
 * Accepts at most a configured number of calls in a fixed or sliding window. Calls beyond the limit are rejected rather than queued. Use the state and timing methods to display capacity and retry timing.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * The selector is the second positional argument. Read utility.state from the template.
 * The contextual utility.Subscribe helper selects state for a child template.
 *
 * Available state fields:
 *
 * - `executionCount`: Number of function executions that have been completed
 * - `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
 * - `isExceeded`: Whether the rate limiter has exceeded the limit
 * - `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
 * - `rejectionCount`: Number of function executions that have been rejected due to rate limiting
 * - `status`: Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded
 *
 * ## Options and ownership
 *
 * Tracked named arguments update options after rendering. createPacerScope supplies shared
 * defaults through contextual helpers. Local named options override those defaults.
 * The synchronous rate limiter has no pending timer to cancel during teardown.
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useRateLimiter } from '@tanstack/ember-pacer'
 * import type { RateLimiterState } from '@tanstack/ember-pacer'
 *
 * const select = (state: RateLimiterState<(value: string) => void>) => ({ executionCount: state.executionCount })
 *
 * <template>
 *   {{#let (useRateLimiter @process select limit=5 window=1000) as |utility|}}
 *     <button {{on "click" (fn utility.maybeExecute "item")}}>Schedule</button>
 *     <span>{{utility.state.executionCount}}</span>
 *   {{/let}}
 * </template>
 * ```
 */
export class UseRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: RateLimiterState) => TSelected]
    Named: EmberRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberRateLimiter<TFn, TSelected>
}> {
  private instance?: EmberRateLimiter<TFn, TSelected>
  private latest?: { fn: TFn; options: EmberRateLimiterOptions<TFn, TSelected> }
  private selector: (state: RateLimiterState) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: RateLimiterState) => TSelected,
    ],
    options: EmberRateLimiterOptions<TFn, TSelected>,
  ): EmberRateLimiter<TFn, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new RateLimiter<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberRateLimiter<TFn, TSelected>
      const selected = select(this, instance.store, (state) =>
        this.selector(state),
      )
      Object.defineProperty(instance, 'Subscribe', {
        value: createSubscribe(instance.store),
        enumerable: true,
      })
      Object.defineProperty(instance, 'state', {
        get: () => selected.value,
        enumerable: true,
      })
      this.instance = instance
      registerDestructor(this, () => {
        if (instance.options.onUnmount) instance.options.onUnmount(instance)
        else {
        }
      })
    } else {
      scheduleOnce('afterRender', this, this.update)
    }
    return this.instance
  }

  private update() {
    if (
      this.instance &&
      this.latest &&
      !isDestroying(this) &&
      !isDestroyed(this)
    ) {
      this.instance.fn = this.latest.fn
      this.instance.setOptions(this.latest.options)
    }
  }
}

export { UseRateLimiter as useRateLimiter }
