import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
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
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an owned RateLimiter from an Ember template.
 *
 * Positional arguments are the execution function and an optional state selector.
 * Named arguments are core options and onUnmount. Ember tracks argument changes,
 * updates the same utility after rendering, and cleans it up when the helper leaves
 * the template. Function-valued options are passed through without invocation.
 *
 * @example
 * ```hbs
 * {{#let (useRateLimiter this.execute wait=this.wait) as |utility|}}
 *   {{utility.state}}
 * {{/let}}
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
