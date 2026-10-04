import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'

/** Options for useAsyncBatcher, including owner cleanup. */
export interface EmberAsyncBatcherOptions<
  TValue,
  TSelected = {},
> extends AsyncBatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberAsyncBatcher<TValue, TSelected>) => void
}

/** A AsyncBatcher with framework-reactive selected state. All core methods remain available. */
export interface EmberAsyncBatcher<TValue, TSelected = {}> extends Omit<
  AsyncBatcher<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncBatcher<TValue>['options'] &
    EmberAsyncBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<EmberAsyncBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an owned AsyncBatcher from an Ember template.
 *
 * Positional arguments are the execution function and an optional state selector.
 * Named arguments are core options and onUnmount. Ember tracks argument changes,
 * updates the same utility after rendering, and cleans it up when the helper leaves
 * the template. Function-valued options are passed through without invocation.
 *
 * @example
 * ```hbs
 * {{#let (useAsyncBatcher this.execute wait=this.wait) as |utility|}}
 *   {{utility.state}}
 * {{/let}}
 * ```
 */
export class UseAsyncBatcher<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => Promise<any>]
      | [
          fn: (items: Array<TValue>) => Promise<any>,
          selector: (state: AsyncBatcherState<TValue>) => TSelected,
        ]
    Named: EmberAsyncBatcherOptions<TValue, TSelected>
  }
  Return: EmberAsyncBatcher<TValue, TSelected>
}> {
  private instance?: EmberAsyncBatcher<TValue, TSelected>
  private latest?: {
    fn: (items: Array<TValue>) => Promise<any>
    options: EmberAsyncBatcherOptions<TValue, TSelected>
  }
  private selector: (state: AsyncBatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: (items: Array<TValue>) => Promise<any>,
      selector?: (state: AsyncBatcherState<TValue>) => TSelected,
    ],
    options: EmberAsyncBatcherOptions<TValue, TSelected>,
  ): EmberAsyncBatcher<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncBatcher<TValue>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncBatcher<TValue, TSelected>
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

export { UseAsyncBatcher as useAsyncBatcher }
