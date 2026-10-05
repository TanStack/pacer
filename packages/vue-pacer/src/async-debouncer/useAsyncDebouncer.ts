import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { VuePacerSubscribe } from '../utils/Subscribe'
import type { ShallowRef } from 'vue'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { VuePacerOptions } from '../types'

/** Options for useAsyncDebouncer, including owner cleanup. */
export interface VueAsyncDebouncerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncDebouncerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: VueAsyncDebouncer<TFn, TSelected>) => void
}

/** An AsyncDebouncer with framework-reactive selected state. All core methods remain available. */
export interface VueAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncDebouncer<TFn>, 'options' | 'setOptions'> {
  options: AsyncDebouncer<TFn>['options'] &
    VueAsyncDebouncerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<VueAsyncDebouncerOptions<TFn, TSelected>>,
  ) => void
  /** Subscribes a scoped slot to state without re-rendering the utility owner. */
  Subscribe: VuePacerSubscribe<AsyncDebouncerState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<ShallowRef<TSelected>>
}

/**
 * Creates and retains the AsyncDebouncer for its Vue owner.
 *
 * Waits for a quiet period, then executes the latest call. Each new call restarts the trailing timer. Configure leading and trailing edges for search, autosave, or resize handlers.
 *
 * The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
 * Use onSuccess, onError, and onSettled for execution outcomes.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * Read selected state through utility.state.value in JavaScript. Vue templates unwrap refs.
 * Use utility.Subscribe with a scoped slot to select state in a child without updating the owner.
 *
 * Available state fields:
 *
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
 * - `errorCount`: Number of function executions that have resulted in errors
 * - `isExecuting`: Whether the debounced function is currently executing asynchronously
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastResult`: The result from the most recent successful function execution
 * - `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
 * - `settleCount`: Number of function executions that have completed (either successfully or with errors)
 * - `status`: Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed
 * - `successCount`: Number of function executions that have completed successfully
 *
 * ## Options and ownership
 *
 * Pass an options object with property getters or a factory. Top-level properties are read
 * reactively; function-valued core options remain callbacks. Local options override provider
 * defaults. Updates retain the utility, its store, counters, and pending work.
 * Disposing the component or effect scope calls cancel() and abort().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { useAsyncDebouncer } from '@tanstack/vue-pacer'
 *
 * const utility = useAsyncDebouncer(
 *   async (value: string) => { console.log(value) },
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending }),
 * )
 * utility.maybeExecute('item')
 * // Selected state: utility.state.value.isPending
 * ```
 * @param fn - Function executed by the utility.
 * @param options - Core options or a reactive factory, plus an optional onUnmount callback.
 * @param selector - Selects state that updates the owner. Omit to leave selected state empty.
 * @returns The retained utility instance with selected state and child subscriptions.
 */
export function useAsyncDebouncer<TFn extends AnyAsyncFunction, TSelected = {}>(
  fn: TFn,
  options: VuePacerOptions<VueAsyncDebouncerOptions<TFn, TSelected>>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): VueAsyncDebouncer<TFn, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): VueAsyncDebouncerOptions<TFn, TSelected> => ({
    ...defaults().asyncDebouncer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncDebouncer<TFn>(
    fn,
    resolve(),
  ) as unknown as VueAsyncDebouncer<TFn, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
    instance.abort()
  })
}
