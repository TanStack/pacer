import {
  assertInInjectionContext,
  computed,
  effect,
  untracked,
} from '@angular/core'
import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { shallow } from '@tanstack/store'
import { injectPacerOptions } from '../provider/providePacerOptions'
import { toAccessorSignal } from '../utils/maybeAccessor'
import {
  injectForwardMethods,
  methodNames,
} from '../utils/injectForwardMethods'
import { injectLazy } from '../utils/injectLazy'
import { injectInsideZone } from '../utils/zoneCompatibility'
import { injectSelector } from '../utils/injectSelector'
import { injectPendingTasksLifecycle } from '../utils/injectPendingTasksLifecycle'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { MethodMap } from '../utils/injectForwardMethods'
import type { ReadonlySelected } from '../utils/internalTypes'
import type { Signal } from '@angular/core'
import type {
  AnyAsyncFunction,
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer'

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

const asyncDebouncerMethodMap = {
  fn: false,
  setOptions: false,
  maybeExecute: true,
  flush: true,
  cancel: true,
  abort: true,
  reset: true,
  getAbortSignal: true,
} satisfies MethodMap<AsyncDebouncer<AnyAsyncFunction>>

const asyncDebouncerMethods = methodNames(asyncDebouncerMethodMap)

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
 * Methods apply current options before executing and schedule work outside Angular's zone. The provided function runs inside Angular's zone.
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
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectAsyncDebouncer)
  }

  const runFn = injectInsideZone(fn)
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed<AngularAsyncDebouncerOptions<TFn>>(() => ({
    ...baseOptions.asyncDebouncer,
    ...optionsSignal(),
  }))

  const getAsyncDebouncer = injectLazy(
    () => new AsyncDebouncer<TFn>(runFn, mergedOptions()),
    (core) => {
      const opts = mergedOptions()
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.cancel()
        core.abort()
      }
    },
  )

  const methods = injectForwardMethods(
    getAsyncDebouncer,
    asyncDebouncerMethods,
    (core) => {
      core.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => getAsyncDebouncer().setOptions(opts))
  })

  const hasPendingTasks = injectSelector(
    () => getAsyncDebouncer().store,
    (state) => state.isPending || state.isExecuting,
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => getAsyncDebouncer().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
