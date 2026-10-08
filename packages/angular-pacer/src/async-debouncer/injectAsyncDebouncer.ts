import { computed, effect, untracked } from '@angular/core'
import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { shallow } from '@tanstack/store'
import { injectPacerOptions } from '../provider/providePacerOptions'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectForwardMethods } from '../utils/injectForwardMethods'
import { injectLazy } from '../utils/injectLazy'
import { injectSelector } from '../utils/injectSelector'
import { injectPendingTasksLifecycle } from '../utils/injectPendingTasksLifecycle'
import type { ReadonlySelected } from '../utils/readonlySelected'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { Signal } from '@angular/core'
import type {
  AnyAsyncFunction,
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer'
import type { MethodKeys } from '../utils/injectForwardMethods'

/**
 * Options for {@link injectAsyncDebouncer}, including core configuration and Angular cleanup.
 */
export interface AngularAsyncDebouncerOptions<
  TFn extends AnyAsyncFunction,
> extends AsyncDebouncerOptions<TFn> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * Providing this callback replaces the default cleanup (cancel pending execution and abort running work).
   */
  onUnmount?: (core: AsyncDebouncer<TFn>) => void
}

const asyncDebouncerMethods = [
  'maybeExecute',
  'flush',
  'cancel',
  'abort',
  'reset',
  'getAbortSignal',
] as const satisfies ReadonlyArray<MethodKeys<AsyncDebouncer<AnyAsyncFunction>>>

type AsyncDebouncerMethod = (typeof asyncDebouncerMethods)[number]

/**
 * An Angular AsyncDebouncer ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Pick<AsyncDebouncer<TFn>, AsyncDebouncerMethod> {
  /** The readonly selector result. Returns an empty object when no selector is supplied. */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular AsyncDebouncer in the current injection context.
 *
 * Waits until calls stop for the configured delay, then runs the latest asynchronous callback.
 *
 * ## Options and state
 *
 * Accepts static options or an options factory. Factories are read lazily, and signal
 * dependencies update the existing core instance. Local options override provider defaults.
 * Methods apply current options before executing and run outside Angular's zone.
 *
 * Pass a selector to expose reactive core state through `state()`. Without a selector,
 * `state()` returns `{}`; operations remain available on the ref.
 *
 * ## Cleanup
 *
 * The default cleanup is to cancel pending execution and abort running work. Set `onUnmount` to replace it.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectAsyncDebouncer(
 *   (query: string) => Promise.resolve(query),
 *   () => ({ wait: 250 }),
 *   (state) => state.isPending,
 * )
 * utility.maybeExecute('search')
 * console.log(utility.state())
 * ```
 */
export function injectAsyncDebouncer<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: MaybeAccessor<AngularAsyncDebouncerOptions<TFn>>,
): AngularAsyncDebouncer<TFn>
/**
 * Creates an Angular AsyncDebouncer with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectAsyncDebouncer<TFn extends AnyAsyncFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularAsyncDebouncerOptions<TFn>>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected,
): AngularAsyncDebouncer<TFn, TSelected>
export function injectAsyncDebouncer<TFn extends AnyAsyncFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularAsyncDebouncerOptions<TFn>>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected | {} = () => ({}),
): AngularAsyncDebouncer<TFn, TSelected | {}> {
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed<AngularAsyncDebouncerOptions<TFn>>(() => ({
    ...baseOptions.asyncDebouncer,
    ...optionsSignal(),
  }))

  const asyncDebouncerSignal = injectLazy(
    () => new AsyncDebouncer<TFn>(fn, mergedOptions()),
  )

  const methods = injectForwardMethods(
    asyncDebouncerSignal,
    asyncDebouncerMethods,
    (core) => {
      core.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => asyncDebouncerSignal().setOptions(opts))
  })

  effect((onCleanup) => {
    const core = asyncDebouncerSignal()
    onCleanup(() => {
      const opts = untracked(mergedOptions)
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.cancel()
        core.abort()
      }
    })
  })

  const hasPendingTasks = injectSelector(
    () => asyncDebouncerSignal().store,
    (state) => state.isPending || state.isExecuting,
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => asyncDebouncerSignal().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
