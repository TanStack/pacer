import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
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

/** A AsyncRateLimiter with framework-reactive selected state. All core methods remain available. */
export interface OctaneAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'options' | 'setOptions'> {
  options: AsyncRateLimiter<TFn>['options'] &
    OctaneAsyncRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<OctaneAsyncRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Octane AsyncRateLimiter with reactive options and automatic owner cleanup.
 *
 * Pass an options object with property getters or a factory. Only top-level properties
 * are evaluated; function-valued core options remain callbacks. Local options override
 * provider defaults. Options update the same instance, preserving pending work and counters.
 *
 * Pass a selector to subscribe to the state your UI reads. The core store remains available
 * for additional subscriptions. Cleanup uses the latest onUnmount option, or the core's
 * default cancellation/stop behavior, including aborting active asynchronous work.
 *
 * @param fn - Function executed by the utility.
 * @param options - Core options and an optional cleanup callback.
 * @param selector - Selects the state consumed by the component.
 * @returns The utility instance with reactive selected state.
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
