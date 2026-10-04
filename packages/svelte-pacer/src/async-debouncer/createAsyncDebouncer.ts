import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { bindPacer } from '../utils/bindPacer.svelte'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { SveltePacerOptions } from '../types'

/** Options for createAsyncDebouncer, including owner cleanup. */
export interface SvelteAsyncDebouncerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncDebouncerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: SvelteAsyncDebouncer<TFn, TSelected>) => void
}

/** A AsyncDebouncer with framework-reactive selected state. All core methods remain available. */
export interface SvelteAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncDebouncer<TFn>, 'options' | 'setOptions'> {
  options: AsyncDebouncer<TFn>['options'] &
    SvelteAsyncDebouncerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<SvelteAsyncDebouncerOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Svelte AsyncDebouncer with reactive options and automatic owner cleanup.
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
export function createAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: SveltePacerOptions<SvelteAsyncDebouncerOptions<TFn, TSelected>>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): SvelteAsyncDebouncer<TFn, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): SvelteAsyncDebouncerOptions<TFn, TSelected> => ({
    ...defaults().asyncDebouncer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncDebouncer<TFn>(
    fn,
    resolve(),
  ) as unknown as SvelteAsyncDebouncer<TFn, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
    instance.abort()
  })
}
