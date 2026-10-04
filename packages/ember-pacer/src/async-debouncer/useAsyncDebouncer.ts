import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
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
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'

/** Options for useAsyncDebouncer, including owner cleanup. */
export interface EmberAsyncDebouncerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncDebouncerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberAsyncDebouncer<TFn, TSelected>) => void
}

/** A AsyncDebouncer with framework-reactive selected state. All core methods remain available. */
export interface EmberAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncDebouncer<TFn>, 'options' | 'setOptions'> {
  options: AsyncDebouncer<TFn>['options'] &
    EmberAsyncDebouncerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<EmberAsyncDebouncerOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an owned AsyncDebouncer from an Ember template.
 *
 * Positional arguments are the execution function and an optional state selector.
 * Named arguments are core options and onUnmount. Ember tracks argument changes,
 * updates the same utility after rendering, and cleans it up when the helper leaves
 * the template. Function-valued options are passed through without invocation.
 *
 * @example
 * ```hbs
 * {{#let (useAsyncDebouncer this.execute wait=this.wait) as |utility|}}
 *   {{utility.state}}
 * {{/let}}
 * ```
 */
export class UseAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncDebouncerState<TFn>) => TSelected]
    Named: EmberAsyncDebouncerOptions<TFn, TSelected>
  }
  Return: EmberAsyncDebouncer<TFn, TSelected>
}> {
  private instance?: EmberAsyncDebouncer<TFn, TSelected>
  private latest?: {
    fn: TFn
    options: EmberAsyncDebouncerOptions<TFn, TSelected>
  }
  private selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: AsyncDebouncerState<TFn>) => TSelected,
    ],
    options: EmberAsyncDebouncerOptions<TFn, TSelected>,
  ): EmberAsyncDebouncer<TFn, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncDebouncer<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncDebouncer<TFn, TSelected>
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

export { UseAsyncDebouncer as useAsyncDebouncer }
