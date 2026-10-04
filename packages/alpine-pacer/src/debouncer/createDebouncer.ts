import { Debouncer } from '@tanstack/pacer/debouncer'
import { bindPacer } from '../utils/bindPacer'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpinePacerOptions } from '../types'

/** Options for createDebouncer, including owner cleanup. */
export interface AlpineDebouncerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends DebouncerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: AlpineDebouncer<TFn, TSelected>) => void
}

/** A Debouncer with framework-reactive selected state. All core methods remain available. */
export interface AlpineDebouncer<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Debouncer<TFn>, 'options' | 'setOptions'> {
  options: Debouncer<TFn>['options'] & AlpineDebouncerOptions<TFn, TSelected>
  setOptions: (options: Partial<AlpineDebouncerOptions<TFn, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an Alpine Debouncer with reactive options and automatic owner cleanup.
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
export function createDebouncer<TFn extends AnyFunction, TSelected = {}>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineDebouncerOptions<TFn, TSelected>>,
  selector: (state: DebouncerState<TFn>) => TSelected = () => ({}) as TSelected,
): AlpineDebouncer<TFn, TSelected> {
  scope.assertActive()
  const defaults = scope.defaultOptions
  const resolve = (): AlpineDebouncerOptions<TFn, TSelected> => ({
    ...defaults().debouncer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Debouncer<TFn>(
    fn,
    resolve(),
  ) as unknown as AlpineDebouncer<TFn, TSelected>
  return bindPacer(scope, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
  })
}
