import { Debouncer } from '@tanstack/pacer/debouncer'
import { bindPacer } from '../utils/bindPacer.svelte'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { SveltePacerSubscribe } from '../utils/createSubscribe'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { SveltePacerOptions } from '../types'

/** Options for createDebouncer, including owner cleanup. */
export interface SvelteDebouncerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends DebouncerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: SvelteDebouncer<TFn, TSelected>) => void
}

/** A Debouncer with framework-reactive selected state. All core methods remain available. */
export interface SvelteDebouncer<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Debouncer<TFn>, 'options' | 'setOptions'> {
  options: Debouncer<TFn>['options'] & SvelteDebouncerOptions<TFn, TSelected>
  setOptions: (options: Partial<SvelteDebouncerOptions<TFn, TSelected>>) => void
  /** Subscribes a child snippet to state without updating the utility owner. */
  Subscribe: SveltePacerSubscribe<DebouncerState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the Debouncer for its Svelte owner.
 *
 * Waits for a quiet period, then executes the latest call. Each new call restarts the trailing timer. Configure leading and trailing edges for search, autosave, or resize handlers.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * Read selected state through utility.state. Use utility.Subscribe with a children snippet
 * to select state in a child without updating the owner.
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
 * Destroying the component calls cancel().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { createDebouncer } from '@tanstack/svelte-pacer'
 *
 * const utility = createDebouncer(
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
export function createDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: SveltePacerOptions<SvelteDebouncerOptions<TFn, TSelected>>,
  selector: (state: DebouncerState<TFn>) => TSelected = () => ({}) as TSelected,
): SvelteDebouncer<TFn, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): SvelteDebouncerOptions<TFn, TSelected> => ({
    ...defaults().debouncer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Debouncer<TFn>(
    fn,
    resolve(),
  ) as unknown as SvelteDebouncer<TFn, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
  })
}
