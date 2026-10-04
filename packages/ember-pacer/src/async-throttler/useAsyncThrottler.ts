import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
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

/** An AsyncThrottler with framework-reactive selected state. All core methods remain available. */
export interface EmberAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncThrottler<TFn>, 'options' | 'setOptions'> {
  options: AsyncThrottler<TFn>['options'] &
    EmberAsyncThrottlerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<EmberAsyncThrottlerOptions<TFn, TSelected>>,
  ) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: EmberPacerSubscribe<AsyncThrottlerState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the AsyncThrottler for its Ember owner.
 *
 * Limits execution to at most one call per wait interval. Leading and trailing options control immediate and deferred execution; the trailing call uses the latest arguments.
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
 * - `errorCount`: Number of function executions that have resulted in errors
 * - `isExecuting`: Whether the throttled function is currently executing asynchronously
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastExecutionTime`: Timestamp of the last function execution in milliseconds
 * - `lastResult`: The result from the most recent successful function execution
 * - `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
 * - `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
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
 * import { useAsyncThrottler } from '@tanstack/ember-pacer'
 * import type { AsyncThrottlerState } from '@tanstack/ember-pacer'
 *
 * const select = (state: AsyncThrottlerState<(value: string) => Promise<void>>) => ({ isPending: state.isPending })
 *
 * <template>
 *   {{#let (useAsyncThrottler @process select wait=500) as |utility|}}
 *     <button {{on "click" (fn utility.maybeExecute "item")}}>Schedule</button>
 *     <span>{{utility.state.isPending}}</span>
 *   {{/let}}
 * </template>
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

export { UseAsyncThrottler as useAsyncThrottler }
