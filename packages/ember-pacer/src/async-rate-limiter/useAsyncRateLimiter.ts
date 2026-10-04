import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'

/** Options for useAsyncRateLimiter, including owner cleanup. */
export interface EmberAsyncRateLimiterOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncRateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberAsyncRateLimiter<TFn, TSelected>) => void
}

/** A AsyncRateLimiter with framework-reactive selected state. All core methods remain available. */
export interface EmberAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'options' | 'setOptions'> {
  options: AsyncRateLimiter<TFn>['options'] &
    EmberAsyncRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<EmberAsyncRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an owned AsyncRateLimiter from an Ember template.
 *
 * Positional arguments are the execution function and an optional state selector.
 * Named arguments are core options and onUnmount. Ember tracks argument changes,
 * updates the same utility after rendering, and cleans it up when the helper leaves
 * the template. Function-valued options are passed through without invocation.
 *
 * @example
 * ```hbs
 * {{#let (useAsyncRateLimiter this.execute wait=this.wait) as |utility|}}
 *   {{utility.state}}
 * {{/let}}
 * ```
 */
export class UseAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncRateLimiterState<TFn>) => TSelected]
    Named: EmberAsyncRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberAsyncRateLimiter<TFn, TSelected>
}> {
  private instance?: EmberAsyncRateLimiter<TFn, TSelected>
  private latest?: {
    fn: TFn
    options: EmberAsyncRateLimiterOptions<TFn, TSelected>
  }
  private selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: AsyncRateLimiterState<TFn>) => TSelected,
    ],
    options: EmberAsyncRateLimiterOptions<TFn, TSelected>,
  ): EmberAsyncRateLimiter<TFn, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncRateLimiter<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncRateLimiter<TFn, TSelected>
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
          instance.abort()
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

export { UseAsyncRateLimiter as useAsyncRateLimiter }
