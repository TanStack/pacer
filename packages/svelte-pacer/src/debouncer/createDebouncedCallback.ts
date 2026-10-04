import { createDebouncer } from './createDebouncer'
import type { SvelteDebouncer, SvelteDebouncerOptions } from './createDebouncer'
import type { SveltePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback owned by the Svelte lifecycle.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. It returns void, independently of the wrapped callback's return value.
 *
 * ## State and ownership
 *
 * Use createDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createDebouncedCallback } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * const schedule = createDebouncedCallback((value: number) => { console.log(value) }, { wait: 500 })
 * schedule(1)
 * ```
 *
 * @see createDebouncer
 */
export function createDebouncedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: SveltePacerOptions<SvelteDebouncerOptions<TFn>>,
): SvelteDebouncer<TFn>['maybeExecute'] {
  return createDebouncer(fn, options).maybeExecute
}
