import { Throttler } from '@tanstack/pacer/throttler'
import { bindPacer } from '../utils/bindPacer.svelte'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { SveltePacerSubscribe } from '../utils/createSubscribe'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { SveltePacerOptions } from '../types'

/** Options for createThrottler, including owner cleanup. */
export interface SvelteThrottlerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends ThrottlerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: SvelteThrottler<TFn, TSelected>) => void
}

/** A Throttler with framework-reactive selected state. All core methods remain available. */
export interface SvelteThrottler<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Throttler<TFn>, 'options' | 'setOptions'> {
  options: Throttler<TFn>['options'] & SvelteThrottlerOptions<TFn, TSelected>
  setOptions: (options: Partial<SvelteThrottlerOptions<TFn, TSelected>>) => void
  /** Subscribes a child snippet to state without updating the utility owner. */
  Subscribe: SveltePacerSubscribe<ThrottlerState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the Throttler for its Svelte owner.
 *
 * Limits execution to at most one call per wait interval. Leading and trailing options control immediate and deferred execution; the trailing call uses the latest arguments.
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
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastExecutionTime`: Timestamp of the last function execution in milliseconds
 * - `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
 * - `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
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
 * import { createThrottler } from '@tanstack/svelte-pacer'
 *
 * const utility = createThrottler(
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
export function createThrottler<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: SveltePacerOptions<SvelteThrottlerOptions<TFn, TSelected>>,
  selector: (state: ThrottlerState<TFn>) => TSelected = () => ({}) as TSelected,
): SvelteThrottler<TFn, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): SvelteThrottlerOptions<TFn, TSelected> => ({
    ...defaults().throttler,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Throttler<TFn>(
    fn,
    resolve(),
  ) as unknown as SvelteThrottler<TFn, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
  })
}
