import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
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

/** A AsyncThrottler with framework-reactive selected state. All core methods remain available. */
export interface OctaneAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncThrottler<TFn>, 'options' | 'setOptions'> {
  options: AsyncThrottler<TFn>['options'] &
    OctaneAsyncThrottlerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<OctaneAsyncThrottlerOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Octane AsyncThrottler with reactive options and automatic owner cleanup.
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
