import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createSubscribe } from '../utils/Subscribe'
import { select } from '../utils/select'
import type { EmberPacerSubscribe } from '../utils/Subscribe'
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

/** An AsyncDebouncer with framework-reactive selected state. All core methods remain available. */
export interface EmberAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncDebouncer<TFn>, 'options' | 'setOptions'> {
  options: AsyncDebouncer<TFn>['options'] &
    EmberAsyncDebouncerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<EmberAsyncDebouncerOptions<TFn, TSelected>>,
  ) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: EmberPacerSubscribe<AsyncDebouncerState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the AsyncDebouncer for its Ember owner.
 *
 * Waits for a quiet period, then executes the latest call. Each new call restarts the trailing timer. Configure leading and trailing edges for search, autosave, or resize handlers.
 *
 * The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
 * Use onSuccess, onError, and onSettled for execution outcomes.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * The selector is the second positional argument. Read utility.state from the template.
 * The contextual utility.Subscribe helper selects state for a child template.
 *
 * Available state fields:
 *
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
 * - `errorCount`: Number of function executions that have resulted in errors
 * - `isExecuting`: Whether the debounced function is currently executing asynchronously
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastResult`: The result from the most recent successful function execution
 * - `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
 * - `settleCount`: Number of function executions that have completed (either successfully or with errors)
 * - `status`: Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed
 * - `successCount`: Number of function executions that have completed successfully
 *
 * ## Options and ownership
 *
 * Tracked named arguments update options after rendering. createPacerScope supplies shared
 * defaults through contextual helpers. Local named options override those defaults.
 * Removing the helper invocation calls cancel() and abort().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useAsyncDebouncer } from '@tanstack/ember-pacer'
 * import type { AsyncDebouncerState } from '@tanstack/ember-pacer'
 *
 * const select = (state: AsyncDebouncerState<(value: string) => Promise<void>>) => ({ isPending: state.isPending })
 *
 * <template>
 *   {{#let (useAsyncDebouncer @process select wait=500) as |utility|}}
 *     <button {{on "click" (fn utility.maybeExecute "item")}}>Schedule</button>
 *     <span>{{utility.state.isPending}}</span>
 *   {{/let}}
 * </template>
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
      Object.defineProperty(instance, 'Subscribe', {
        value: createSubscribe(instance.store),
        enumerable: true,
      })
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
