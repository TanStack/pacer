import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { createSubscribe } from '../utils/Subscribe'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { OctanePacerSubscribe } from '../utils/Subscribe'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'
import type { OctanePacerOptions } from '../types'

/** Options for useAsyncThrottler, including owner cleanup. */
export interface OctaneAsyncThrottlerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncThrottlerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneAsyncThrottler<TFn, TSelected>) => void
}

/** An AsyncThrottler with framework-reactive selected state. All core methods remain available. */
export interface OctaneAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncThrottler<TFn>, 'options' | 'setOptions'> {
  options: AsyncThrottler<TFn>['options'] &
    OctaneAsyncThrottlerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<OctaneAsyncThrottlerOptions<TFn, TSelected>>,
  ) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: OctanePacerSubscribe<AsyncThrottlerState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the AsyncThrottler for its Octane owner.
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
 * Read selected state through utility.state. Use utility.Subscribe with a render callback
 * to select state in a child without subscribing the owner.
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
 * Pass an options object with property getters or a factory. Top-level properties are read
 * reactively; function-valued core options remain callbacks. Local options override provider
 * defaults. Updates retain the utility, its store, counters, and pending work.
 * Unmounting the component calls cancel() and abort().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { useAsyncThrottler } from '@tanstack/octane-pacer'
 *
 * const utility = useAsyncThrottler(
 *   async (value: string) => { console.log(value) },
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending }),
 * )
 * utility.maybeExecute('item')
 * // Selected state: utility.state.isPending
 * ```
 * @param fn - Function executed by the utility.
 * @param options - Core options or a reactive factory, plus an optional onUnmount callback.
 * @param selector - Selects state that updates the owner. Omit to leave selected state empty.
 * @returns The retained utility instance with selected state and child subscriptions.
 */
export function useAsyncThrottler<TFn extends AnyAsyncFunction, TSelected = {}>(
  fn: TFn,
  options: OctanePacerOptions<OctaneAsyncThrottlerOptions<TFn, TSelected>>,
  selector?: (state: AsyncThrottlerState<TFn>) => TSelected,
): OctaneAsyncThrottler<TFn, TSelected>
export function useAsyncThrottler<TFn extends AnyAsyncFunction, TSelected = {}>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneAsyncThrottlerOptions<TFn, TSelected>>,
    selector?: (state: AsyncThrottlerState<TFn>) => TSelected,
    slot?: symbol,
  ]
): OctaneAsyncThrottler<TFn, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneAsyncThrottlerOptions<TFn, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: AsyncThrottlerState<TFn>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneAsyncThrottlerOptions<TFn, TSelected> = {
    ...defaults.asyncThrottler,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneAsyncThrottler<TFn, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new AsyncThrottler<TFn>(
    fn,
    merged,
  ) as unknown as OctaneAsyncThrottler<TFn, TSelected>
  const instance = ref.current
  if (!Object.hasOwn(instance, 'Subscribe')) {
    Object.defineProperty(instance, 'Subscribe', {
      value: createSubscribe(instance.store),
      enumerable: true,
    })
  }
  useLayoutEffect(
    () => {
      instance.fn = fn
      instance.setOptions(merged)
    },
    null,
    subSlot(slot, 'options'),
  )
  const state = select(
    instance.store,
    selector,
    { compare: shallow },
    subSlot(slot, 'state'),
  )
  Object.defineProperty(instance, 'state', {
    value: state,
    configurable: true,
    enumerable: true,
  })
  useLayoutEffect(
    () => () => {
      if (instance.options.onUnmount) instance.options.onUnmount(instance)
      else {
        instance.cancel()
        instance.abort()
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
