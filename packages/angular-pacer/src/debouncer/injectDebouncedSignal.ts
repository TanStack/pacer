import { linkedSignal } from '@angular/core'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectDebouncer } from './injectDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type {
  AngularDebouncer,
  AngularDebouncerOptions,
} from './injectDebouncer'
import type { Signal } from '@angular/core'

/**
 * A readonly Angular value signal with paced `set`/`update` methods.
 * The `debouncer` attribute exposes the underlying Debouncer methods.
 */
export interface AngularDebouncerSignal<
  TValue,
  TSelected = {},
> extends Signal<TValue> {
  /** Schedules the replacement value after the debounce delay. */
  set: (value: TValue) => void
  /** Runs the updater with the current committed value when the write executes. */
  update: (updateFn: (previous: TValue) => TValue) => void
  /** The underlying Angular Debouncer ref for controlling execution. */
  debouncer: AngularDebouncer<(callback: () => void) => void, TSelected>
}
/**
 * Creates an Angular debounced editable signal.
 *
 * The initial value is available synchronously. `set` and `update` debounce writes: a newer write restarts the delay and replaces the pending write. An updater runs against the committed value when the delay expires.
 *
 * The returned value is a real Angular signal with the underlying utility exposed
 * on `debouncer`. Options accept a static object or reactive factory and follow
 * {@link injectDebouncer} lifecycle and provider behavior.
 *
 * @param initialValue The initial committed value.
 * @param options Core options or a reactive options factory.
 * @returns The value signal with `set`, `update`, and a `debouncer` attribute.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const value = injectDebouncedSignal(0, { wait: 250 })
 * value.set(10)
 * value.update(previous => previous + 1)
 * console.log(value())
 * ```
 */
export function injectDebouncedSignal<TValue>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularDebouncerOptions<(callback: () => void) => void>
  >,
): AngularDebouncerSignal<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectDebouncedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularDebouncerOptions<(callback: () => void) => void>
  >,
  selector: (
    state: DebouncerState<(callback: () => void) => void>,
  ) => TSelected,
): AngularDebouncerSignal<TValue, TSelected>
export function injectDebouncedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularDebouncerOptions<(callback: () => void) => void>
  >,
  selector?: (
    state: DebouncerState<(callback: () => void) => void>,
  ) => TSelected,
): AngularDebouncerSignal<TValue, TSelected | {}> {
  const debouncedSignal = linkedSignal(toAccessorSignal(initialValue))
  const debouncer = injectDebouncer(
    (callback: () => void) => callback(),
    options,
    (state) => (selector ? selector(state) : {}),
  )
  return Object.assign(debouncedSignal.asReadonly(), {
    set: (value: TValue) =>
      debouncer.maybeExecute(() => debouncedSignal.set(value)),
    update: (updateFn: (prev: TValue) => TValue) =>
      debouncer.maybeExecute(() => debouncedSignal.update(updateFn)),
    debouncer,
  })
}
