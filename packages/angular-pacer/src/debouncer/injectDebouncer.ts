import { computed, effect, untracked } from '@angular/core'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { shallow } from '@tanstack/store'
import { injectPacerOptions } from '../provider/providePacerOptions'
import { toAccessorSignal } from '../utils/maybeAccessor'
import {
  injectForwardMethods,
  methodNames,
} from '../utils/injectForwardMethods'
import { injectLazy } from '../utils/injectLazy'
import { injectSelector } from '../utils/injectSelector'
import { injectPendingTasksLifecycle } from '../utils/injectPendingTasksLifecycle'
import type { ReadonlySelected } from '../utils/readonlySelected'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { Signal } from '@angular/core'
import type {
  AnyFunction,
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer'
import type { MethodMap } from '../utils/injectForwardMethods'

/**
 * Options for {@link injectDebouncer}, including core configuration and Angular cleanup.
 */
export interface AngularDebouncerOptions<
  TFn extends AnyFunction = AnyFunction,
> extends DebouncerOptions<TFn> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * Providing this callback replaces the default cleanup (cancel pending execution).
   */
  onUnmount?: (core: Debouncer<TFn>) => void
}

const debouncerMethodMap = {
  fn: false,
  setOptions: false,
  maybeExecute: true,
  flush: true,
  cancel: true,
  reset: true,
} satisfies MethodMap<Debouncer<AnyFunction>>

const debouncerMethods = methodNames(debouncerMethodMap)

type DebouncerMethod = (typeof debouncerMethods)[number]

/**
 * An Angular Debouncer ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularDebouncer<
  TFn extends AnyFunction = AnyFunction,
  TSelected = {},
> extends Pick<Debouncer<TFn>, DebouncerMethod> {
  /** The readonly selector result. Returns an empty object when no selector is supplied. */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular Debouncer in the current injection context.
 *
 * Waits until calls stop for the configured delay, then runs the latest callback. Each new call restarts the delay.
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
 * The default cleanup is to cancel pending execution. Set `onUnmount` to replace it.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectDebouncer(
 *   (query: string) => console.log(query),
 *   () => ({ wait: 250 }),
 *   (state) => state.isPending,
 * )
 * utility.maybeExecute('search')
 * console.log(utility.state())
 * ```
 */
export function injectDebouncer<TFn extends AnyFunction>(
  fn: TFn,
  options: MaybeAccessor<AngularDebouncerOptions<TFn>>,
): AngularDebouncer<TFn>
/**
 * Creates an Angular Debouncer with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectDebouncer<TFn extends AnyFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularDebouncerOptions<TFn>>,
  selector: (state: DebouncerState<TFn>) => TSelected,
): AngularDebouncer<TFn, TSelected>
export function injectDebouncer<TFn extends AnyFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularDebouncerOptions<TFn>>,
  selector: (state: DebouncerState<TFn>) => TSelected | {} = () => ({}),
): AngularDebouncer<TFn, TSelected | {}> {
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed<AngularDebouncerOptions<TFn>>(() => ({
    ...baseOptions.debouncer,
    ...optionsSignal(),
  }))

  const debouncerSignal = injectLazy(
    () => new Debouncer<TFn>(fn, mergedOptions()),
  )

  const methods = injectForwardMethods(
    debouncerSignal,
    debouncerMethods,
    (core) => {
      core.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => debouncerSignal().setOptions(opts))
  })

  effect((onCleanup) => {
    const core = debouncerSignal()
    onCleanup(() => {
      const opts = untracked(mergedOptions)
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.cancel()
      }
    })
  })

  const hasPendingTasks = injectSelector(
    () => debouncerSignal().store,
    (state) => state.isPending,
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => debouncerSignal().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
