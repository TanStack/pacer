import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
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
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'

/** Options for useAsyncThrottler, including owner cleanup. */
export interface EmberAsyncThrottlerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncThrottlerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberAsyncThrottler<TFn, TSelected>) => void
}

/** A AsyncThrottler with framework-reactive selected state. All core methods remain available. */
export interface EmberAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncThrottler<TFn>, 'options' | 'setOptions'> {
  options: AsyncThrottler<TFn>['options'] &
    EmberAsyncThrottlerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<EmberAsyncThrottlerOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an owned AsyncThrottler from an Ember template.
 *
 * Positional arguments are the execution function and an optional state selector.
 * Named arguments are core options and onUnmount. Ember tracks argument changes,
 * updates the same utility after rendering, and cleans it up when the helper leaves
 * the template. Function-valued options are passed through without invocation.
 *
 * @example
 * ```hbs
 * {{#let (useAsyncThrottler this.execute wait=this.wait) as |utility|}}
 *   {{utility.state}}
 * {{/let}}
 * ```
 */
export class UseAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncThrottlerState<TFn>) => TSelected]
    Named: EmberAsyncThrottlerOptions<TFn, TSelected>
  }
  Return: EmberAsyncThrottler<TFn, TSelected>
}> {
  private instance?: EmberAsyncThrottler<TFn, TSelected>
  private latest?: {
    fn: TFn
    options: EmberAsyncThrottlerOptions<TFn, TSelected>
  }
  private selector: (state: AsyncThrottlerState<TFn>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: AsyncThrottlerState<TFn>) => TSelected,
    ],
    options: EmberAsyncThrottlerOptions<TFn, TSelected>,
  ): EmberAsyncThrottler<TFn, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncThrottler<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncThrottler<TFn, TSelected>
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
          instance.cancel()
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

export { UseAsyncThrottler as useAsyncThrottler }
