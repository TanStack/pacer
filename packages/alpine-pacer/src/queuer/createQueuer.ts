import { Queuer } from '@tanstack/pacer/queuer'
import { bindPacer } from '../utils/bindPacer'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpinePacerOptions } from '../types'

/** Options for createQueuer, including owner cleanup. */
export interface AlpineQueuerOptions<
  TValue,
  TSelected = {},
> extends QueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: AlpineQueuer<TValue, TSelected>) => void
}

/** A Queuer with framework-reactive selected state. All core methods remain available. */
export interface AlpineQueuer<TValue, TSelected = {}> extends Omit<
  Queuer<TValue>,
  'options' | 'setOptions'
> {
  options: Queuer<TValue>['options'] & AlpineQueuerOptions<TValue, TSelected>
  setOptions: (options: Partial<AlpineQueuerOptions<TValue, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an Alpine Queuer with reactive options and automatic owner cleanup.
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
export function createQueuer<TValue, TSelected = {}>(
  scope: PacerScope,
  fn: (item: TValue) => void,
  options: AlpinePacerOptions<AlpineQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = () => ({}) as TSelected,
): AlpineQueuer<TValue, TSelected> {
  scope.assertActive()
  const defaults = scope.defaultOptions
  const resolve = (): AlpineQueuerOptions<TValue, TSelected> => ({
    ...defaults().queuer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Queuer<TValue>(fn, resolve()) as unknown as AlpineQueuer<
    TValue,
    TSelected
  >
  return bindPacer(scope, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.stop()
  })
}
