import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

/** Options for useAsyncQueuer, including owner cleanup. */
export interface EmberAsyncQueuerOptions<
  TValue,
  TSelected = {},
> extends AsyncQueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberAsyncQueuer<TValue, TSelected>) => void
}

/** A AsyncQueuer with framework-reactive selected state. All core methods remain available. */
export interface EmberAsyncQueuer<TValue, TSelected = {}> extends Omit<
  AsyncQueuer<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncQueuer<TValue>['options'] &
    EmberAsyncQueuerOptions<TValue, TSelected>
  setOptions: (
    options: Partial<EmberAsyncQueuerOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an owned AsyncQueuer from an Ember template.
 *
 * Positional arguments are the execution function and an optional state selector.
 * Named arguments are core options and onUnmount. Ember tracks argument changes,
 * updates the same utility after rendering, and cleans it up when the helper leaves
 * the template. Function-valued options are passed through without invocation.
 *
 * @example
 * ```hbs
 * {{#let (useAsyncQueuer this.execute wait=this.wait) as |utility|}}
 *   {{utility.state}}
 * {{/let}}
 * ```
 */
export class UseAsyncQueuer<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [fn: (item: TValue) => Promise<any>]
      | [
          fn: (item: TValue) => Promise<any>,
          selector: (state: AsyncQueuerState<TValue>) => TSelected,
        ]
    Named: EmberAsyncQueuerOptions<TValue, TSelected>
  }
  Return: EmberAsyncQueuer<TValue, TSelected>
}> {
  private instance?: EmberAsyncQueuer<TValue, TSelected>
  private latest?: {
    fn: (item: TValue) => Promise<any>
    options: EmberAsyncQueuerOptions<TValue, TSelected>
  }
  private selector: (state: AsyncQueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: (item: TValue) => Promise<any>,
      selector?: (state: AsyncQueuerState<TValue>) => TSelected,
    ],
    options: EmberAsyncQueuerOptions<TValue, TSelected>,
  ): EmberAsyncQueuer<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncQueuer<TValue>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncQueuer<TValue, TSelected>
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
          instance.stop()
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

export { UseAsyncQueuer as useAsyncQueuer }
