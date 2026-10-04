import { Batcher } from '@tanstack/pacer/batcher'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'

/** Options for useBatcher, including owner cleanup. */
export interface EmberBatcherOptions<
  TValue,
  TSelected = {},
> extends BatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberBatcher<TValue, TSelected>) => void
}

/** A Batcher with framework-reactive selected state. All core methods remain available. */
export interface EmberBatcher<TValue, TSelected = {}> extends Omit<
  Batcher<TValue>,
  'options' | 'setOptions'
> {
  options: Batcher<TValue>['options'] & EmberBatcherOptions<TValue, TSelected>
  setOptions: (options: Partial<EmberBatcherOptions<TValue, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an owned Batcher from an Ember template.
 *
 * Positional arguments are the execution function and an optional state selector.
 * Named arguments are core options and onUnmount. Ember tracks argument changes,
 * updates the same utility after rendering, and cleans it up when the helper leaves
 * the template. Function-valued options are passed through without invocation.
 *
 * @example
 * ```hbs
 * {{#let (useBatcher this.execute wait=this.wait) as |utility|}}
 *   {{utility.state}}
 * {{/let}}
 * ```
 */
export class UseBatcher<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => void]
      | [
          fn: (items: Array<TValue>) => void,
          selector: (state: BatcherState<TValue>) => TSelected,
        ]
    Named: EmberBatcherOptions<TValue, TSelected>
  }
  Return: EmberBatcher<TValue, TSelected>
}> {
  private instance?: EmberBatcher<TValue, TSelected>
  private latest?: {
    fn: (items: Array<TValue>) => void
    options: EmberBatcherOptions<TValue, TSelected>
  }
  private selector: (state: BatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: (items: Array<TValue>) => void,
      selector?: (state: BatcherState<TValue>) => TSelected,
    ],
    options: EmberBatcherOptions<TValue, TSelected>,
  ): EmberBatcher<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new Batcher<TValue>(
        fn,
        this.latest.options,
      ) as unknown as EmberBatcher<TValue, TSelected>
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

export { UseBatcher as useBatcher }
