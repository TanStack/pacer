import { createDebouncer } from './createDebouncer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineDebouncer, AlpineDebouncerOptions } from './createDebouncer'
import type { AlpinePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback owned by the Alpine lifecycle.
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
 * Pass the owning PacerScope first, or call the method on that scope. Destroy the scope in the Alpine component's destroy method.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createDebouncedCallback } from '@tanstack/alpine-pacer'
 *
 * // scope belongs to the current Alpine component.
 * const schedule = createDebouncedCallback(scope, (value: number) => { console.log(value) }, { wait: 500 })
 * schedule(1)
 * ```
 *
 * @see createDebouncer
 */
export function createDebouncedCallback<TFn extends AnyFunction>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineDebouncerOptions<TFn>>,
): AlpineDebouncer<TFn>['maybeExecute'] {
  return createDebouncer(scope, fn, options).maybeExecute
}
