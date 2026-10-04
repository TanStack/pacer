import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { createSubscribe } from '../utils/Subscribe'
import { select } from '../utils/select'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type {
  EmberRateLimiter,
  EmberRateLimiterOptions,
} from './useRateLimiter'
/** Reactive value, update method, and underlying utility returned by useRateLimitedValue. */
export interface EmberRateLimitedValue<TValue, TSelected = {}> {
  readonly value: TValue
  setValue: (value: TValue) => void
  utility: EmberRateLimiter<(value: TValue) => void, TSelected>
}

/**
 * Derives a rate-limited value from its current source.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Yields an object with value, setValue, and utility. Read value in the template; utility exposes controls and selected state. Pass the current tracked value as the first positional argument. The initial value is available immediately. Source changes schedule updates on the existing utility.
 *
 * ## State and ownership
 *
 * The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.
 *
 * Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
 * Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```gts
 * import { useRateLimitedValue } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useRateLimitedValue @source limit=3 window=1000) as |result|}}
 *   <output>{{result.value}}</output>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useRateLimiter
 */
export class UseRateLimitedValue<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [value: TValue, selector: (state: RateLimiterState) => TSelected]
    Named: EmberRateLimiterOptions<(value: TValue) => void, TSelected>
  }
  Return: EmberRateLimitedValue<TValue, TSelected>
}> {
  private result?: EmberRateLimitedValue<TValue, TSelected>
  private latest?: {
    value: TValue
    options: EmberRateLimiterOptions<(value: TValue) => void, TSelected>
  }
  private initialized = false
  private previous?: TValue
  private selector: (state: RateLimiterState) => TSelected = () =>
    ({}) as TSelected
  compute(
    [value, selector]: [TValue, ((state: RateLimiterState) => TSelected)?],
    options: EmberRateLimiterOptions<(value: TValue) => void, TSelected>,
  ): EmberRateLimitedValue<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { value, options: { ...options } }
    if (!this.result) {
      const cell = trackedObject({ value })
      const utility = new RateLimiter<(value: TValue) => void>((next) => {
        cell.value = next
      }, this.latest.options) as unknown as EmberRateLimiter<
        (value: TValue) => void,
        TSelected
      >
      const selected = select(this, utility.store, (state) =>
        this.selector(state),
      )
      Object.defineProperty(utility, 'Subscribe', {
        value: createSubscribe(utility.store),
        enumerable: true,
      })
      Object.defineProperty(utility, 'state', {
        get: () => selected.value,
        enumerable: true,
      })
      this.result = {
        get value() {
          return cell.value
        },
        setValue: (next) => {
          utility.maybeExecute(next)
        },
        utility,
      }
      this.previous = value
      registerDestructor(this, () => {
        if (utility.options.onUnmount) utility.options.onUnmount(utility)
        else {
        }
      })
    }
    scheduleOnce('afterRender', this, this.update)
    return this.result
  }
  private update() {
    if (!this.latest || !this.result || isDestroyed(this) || isDestroying(this))
      return
    this.result.utility.setOptions(this.latest.options)
    if (!this.initialized || !Object.is(this.previous, this.latest.value)) {
      this.initialized = true
      this.previous = this.latest.value
      this.result.setValue(this.latest.value)
    }
  }
}

export { UseRateLimitedValue as useRateLimitedValue }
