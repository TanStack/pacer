import { Debouncer } from '@tanstack/pacer/debouncer'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { createSubscribe } from '../utils/Subscribe'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { OctanePacerSubscribe } from '../utils/Subscribe'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'
import type { OctanePacerOptions } from '../types'

/** Options for useDebouncer, including owner cleanup. */
export interface OctaneDebouncerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends DebouncerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneDebouncer<TFn, TSelected>) => void
}

/** A Debouncer with framework-reactive selected state. All core methods remain available. */
export interface OctaneDebouncer<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Debouncer<TFn>, 'options' | 'setOptions'> {
  options: Debouncer<TFn>['options'] & OctaneDebouncerOptions<TFn, TSelected>
  setOptions: (options: Partial<OctaneDebouncerOptions<TFn, TSelected>>) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: OctanePacerSubscribe<DebouncerState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the Debouncer for its Octane owner.
 *
 * Waits for a quiet period, then executes the latest call. Each new call restarts the trailing timer. Configure leading and trailing edges for search, autosave, or resize handlers.
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
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
 * - `status`: Current execution status - 'idle' when not active, 'pending' when waiting for timeout
 *
 * ## Options and ownership
 *
 * Pass an options object with property getters or a factory. Top-level properties are read
 * reactively; function-valued core options remain callbacks. Local options override provider
 * defaults. Updates retain the utility, its store, counters, and pending work.
 * Unmounting the component calls cancel().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { useDebouncer } from '@tanstack/octane-pacer'
 *
 * const utility = useDebouncer(
 *   (value: string) => { console.log(value) },
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
export function useDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: OctanePacerOptions<OctaneDebouncerOptions<TFn, TSelected>>,
  selector?: (state: DebouncerState<TFn>) => TSelected,
): OctaneDebouncer<TFn, TSelected>
export function useDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneDebouncerOptions<TFn, TSelected>>,
    selector?: (state: DebouncerState<TFn>) => TSelected,
    slot?: symbol,
  ]
): OctaneDebouncer<TFn, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneDebouncerOptions<TFn, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: DebouncerState<TFn>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneDebouncerOptions<TFn, TSelected> = {
    ...defaults.debouncer,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneDebouncer<TFn, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new Debouncer<TFn>(fn, merged) as unknown as OctaneDebouncer<
    TFn,
    TSelected
  >
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
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
