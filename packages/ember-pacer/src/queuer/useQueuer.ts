import { Queuer } from '@tanstack/pacer/queuer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

/** Options for useQueuer, including owner cleanup. */
export interface EmberQueuerOptions<
  TValue,
  TSelected = {},
> extends QueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberQueuer<TValue, TSelected>) => void
}

/** A Queuer with framework-reactive selected state. All core methods remain available. */
export interface EmberQueuer<TValue, TSelected = {}> extends Omit<
  Queuer<TValue>,
  'options' | 'setOptions'
> {
  options: Queuer<TValue>['options'] & EmberQueuerOptions<TValue, TSelected>
  setOptions: (options: Partial<EmberQueuerOptions<TValue, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an owned Queuer from an Ember template.
 *
 * Positional arguments are the execution function and an optional state selector.
 * Named arguments are core options and onUnmount. Ember tracks argument changes,
 * updates the same utility after rendering, and cleans it up when the helper leaves
 * the template. Function-valued options are passed through without invocation.
 *
 * @example
 * ```hbs
 * {{#let (useQueuer this.execute wait=this.wait) as |utility|}}
 *   {{utility.state}}
 * {{/let}}
 * ```
 */
export class UseQueuer<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [fn: (item: TValue) => void]
      | [
          fn: (item: TValue) => void,
          selector: (state: QueuerState<TValue>) => TSelected,
        ]
    Named: EmberQueuerOptions<TValue, TSelected>
  }
  Return: EmberQueuer<TValue, TSelected>
}> {
  private instance?: EmberQueuer<TValue, TSelected>
  private latest?: {
    fn: (item: TValue) => void
    options: EmberQueuerOptions<TValue, TSelected>
  }
  private selector: (state: QueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: (item: TValue) => void,
      selector?: (state: QueuerState<TValue>) => TSelected,
    ],
    options: EmberQueuerOptions<TValue, TSelected>,
  ): EmberQueuer<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new Queuer<TValue>(
        fn,
        this.latest.options,
      ) as unknown as EmberQueuer<TValue, TSelected>
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

export { UseQueuer as useQueuer }
