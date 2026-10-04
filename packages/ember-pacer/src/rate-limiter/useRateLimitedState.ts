import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { select } from '../utils/select'
import type { SetValue } from '../utils/cell'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type {
  EmberRateLimiter,
  EmberRateLimiterOptions,
} from './useRateLimiter'
/** Reactive value, update method, and underlying utility returned by useRateLimitedState. */
export interface EmberRateLimitedState<TValue, TSelected = {}> {
  readonly value: TValue
  setValue: SetValue<TValue>
  utility: EmberRateLimiter<SetValue<TValue>, TSelected>
}

/**
 * Creates ratelimited state from an initial value.
 * Reads and renders through the returned value property. The utility exposes all control methods.
 * Named options update after rendering; pending work is preserved until owner cleanup.
 */
export class UseRateLimitedState<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [value: TValue, selector: (state: RateLimiterState) => TSelected]
    Named: EmberRateLimiterOptions<SetValue<TValue>, TSelected>
  }
  Return: EmberRateLimitedState<TValue, TSelected>
}> {
  private result?: EmberRateLimitedState<TValue, TSelected>
  private latest?: {
    value: TValue
    options: EmberRateLimiterOptions<SetValue<TValue>, TSelected>
  }
  private selector: (state: RateLimiterState) => TSelected = () =>
    ({}) as TSelected
  compute(
    [value, selector]: [TValue, ((state: RateLimiterState) => TSelected)?],
    options: EmberRateLimiterOptions<SetValue<TValue>, TSelected>,
  ): EmberRateLimitedState<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { value, options: { ...options } }
    if (!this.result) {
      const cell = trackedObject({ value })
      const utility = new RateLimiter<SetValue<TValue>>((next) => {
        cell.value =
          typeof next === 'function'
            ? (next as (previous: TValue) => TValue)(cell.value)
            : next
      }, this.latest.options) as unknown as EmberRateLimiter<
        SetValue<TValue>,
        TSelected
      >
      const selected = select(this, utility.store, (state) =>
        this.selector(state),
      )
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
      registerDestructor(this, () => {
        if (utility.options.onUnmount) utility.options.onUnmount(utility)
        else {
        }
      })
    } else scheduleOnce('afterRender', this, this.update)
    return this.result
  }
  private update() {
    if (!this.latest || !this.result || isDestroyed(this) || isDestroying(this))
      return
    this.result.utility.setOptions(this.latest.options)
  }
}

export { UseRateLimitedState as useRateLimitedState }
