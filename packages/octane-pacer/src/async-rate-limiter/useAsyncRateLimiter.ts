import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { createSubscribe } from '../utils/Subscribe'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { OctanePacerSubscribe } from '../utils/Subscribe'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'
import type { OctanePacerOptions } from '../types'

/** Options for useAsyncRateLimiter, including owner cleanup. */
export interface OctaneAsyncRateLimiterOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncRateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneAsyncRateLimiter<TFn, TSelected>) => void
}

/** An AsyncRateLimiter with framework-reactive selected state. All core methods remain available. */
export interface OctaneAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'options' | 'setOptions'> {
  options: AsyncRateLimiter<TFn>['options'] &
    OctaneAsyncRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<OctaneAsyncRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: OctanePacerSubscribe<AsyncRateLimiterState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the AsyncRateLimiter for its Octane owner.
 *
 * Accepts at most a configured number of calls in a fixed or sliding window. Calls beyond the limit are rejected rather than queued. Use the state and timing methods to display capacity and retry timing.
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
 * - `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
 * - `isExceeded`: Whether the rate limiter has exceeded the limit
 * - `isExecuting`: Whether the rate-limited function is currently executing asynchronously
 * - `lastResult`: The result from the most recent successful function execution
 * - `rejectionCount`: Number of function executions that have been rejected due to rate limiting
 * - `settleCount`: Number of function executions that have completed (either successfully or with errors)
 * - `status`: Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded
 * - `successCount`: Number of function executions that have completed successfully
 * - `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
 *
 * ## Options and ownership
 *
 * Pass an options object with property getters or a factory. Top-level properties are read
 * reactively; function-valued core options remain callbacks. Local options override provider
 * defaults. Updates retain the utility, its store, counters, and pending work.
 * Unmounting the component calls abort().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { useAsyncRateLimiter } from '@tanstack/octane-pacer'
 *
 * const utility = useAsyncRateLimiter(
 *   async (value: string) => { console.log(value) },
 *   { limit: 5, window: 1000 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * utility.maybeExecute('item')
 * // Selected state: utility.state.executionCount
 * ```
 * @param fn - Function executed by the utility.
 * @param options - Core options or a reactive factory, plus an optional onUnmount callback.
 * @param selector - Selects state that updates the owner. Omit to leave selected state empty.
 * @returns The retained utility instance with selected state and child subscriptions.
 */
export function useAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: OctanePacerOptions<OctaneAsyncRateLimiterOptions<TFn, TSelected>>,
  selector?: (state: AsyncRateLimiterState<TFn>) => TSelected,
): OctaneAsyncRateLimiter<TFn, TSelected>
export function useAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneAsyncRateLimiterOptions<TFn, TSelected>>,
    selector?: (state: AsyncRateLimiterState<TFn>) => TSelected,
    slot?: symbol,
  ]
): OctaneAsyncRateLimiter<TFn, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneAsyncRateLimiterOptions<TFn, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: AsyncRateLimiterState<TFn>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneAsyncRateLimiterOptions<TFn, TSelected> = {
    ...defaults.asyncRateLimiter,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneAsyncRateLimiter<TFn, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new AsyncRateLimiter<TFn>(
    fn,
    merged,
  ) as unknown as OctaneAsyncRateLimiter<TFn, TSelected>
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
        instance.abort()
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
