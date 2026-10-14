import {
  assertInInjectionContext,
  linkedSignal,
  untracked,
} from '@angular/core'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectDebouncer } from './injectDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { SignalWrite } from '../utils/internalTypes'
import type {
  AngularDebouncer,
  AngularDebouncerOptions,
} from './injectDebouncer'
import type { WritableSignal } from '@angular/core'

/**
 * An Angular writable signal whose `set` and `update` writes are debounced.
 * New writes replace the pending write and restart the delay. Updaters receive
 * the committed value when the write executes. `asReadonly()` exposes a live
 * readonly view. The `debouncer` attribute controls execution.
 */
export interface AngularDebouncerSignal<
  TValue,
  TSelected = {},
> extends WritableSignal<TValue> {
  /** The underlying Angular Debouncer ref for controlling execution. */
  debouncer: AngularDebouncer<(value: SignalWrite<TValue>) => void, TSelected>
}
/**
 * Creates an Angular debounced editable signal.
 *
 * The initial value is available synchronously. `set` and `update` debounce writes: a newer write restarts the delay and replaces the pending write. An updater runs against the committed value when the delay expires.
 *
 * The returned value is a real Angular writable signal with the underlying utility exposed
 * on `debouncer`. Options accept a static object or reactive factory and follow
 * {@link injectDebouncer} lifecycle and provider behavior.
 *
 * @param initialValue The initial committed value.
 * @param options Core options or a reactive options factory.
 * @returns The writable signal with `set`, `update`, `asReadonly`, and a `debouncer` attribute.
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
    AngularDebouncerOptions<(value: SignalWrite<TValue>) => void>
  >,
): AngularDebouncerSignal<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectDebouncedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularDebouncerOptions<(value: SignalWrite<TValue>) => void>
  >,
  selector: (
    state: DebouncerState<(value: SignalWrite<TValue>) => void>,
  ) => TSelected,
): AngularDebouncerSignal<TValue, TSelected>
export function injectDebouncedSignal<TValue, TSelected>(
  initialValue: MaybeAccessor<TValue>,
  options: MaybeAccessor<
    AngularDebouncerOptions<(value: SignalWrite<TValue>) => void>
  >,
  selector?: (
    state: DebouncerState<(value: SignalWrite<TValue>) => void>,
  ) => TSelected,
): AngularDebouncerSignal<TValue, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectDebouncedSignal)
  }

  const initialValueSignal = toAccessorSignal(initialValue)
  const debouncedSignal = linkedSignal(() => untracked(initialValueSignal))
  const commitValue = debouncedSignal.set
  const debouncer = injectDebouncer(
    (value: SignalWrite<TValue>) => {
      commitValue(
        typeof value === 'function'
          ? (value as (previous: TValue) => TValue)(debouncedSignal())
          : value,
      )
    },
    options,
    (state) => (selector ? selector(state) : {}),
  )
  return Object.assign(debouncedSignal, {
    set: (value: TValue) =>
      debouncer.maybeExecute(
        (typeof value === 'function'
          ? () => value
          : value) as SignalWrite<TValue>,
      ),
    update: (updateFn: (prev: TValue) => TValue) =>
      debouncer.maybeExecute(updateFn),
    debouncer,
  })
}
