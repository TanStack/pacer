import {
  assertInInjectionContext,
  computed,
  effect,
  linkedSignal,
  untracked,
} from '@angular/core'
import { injectDebouncer } from './injectDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type {
  AngularDebouncer,
  AngularDebouncerOptions,
} from './injectDebouncer'
import type { Signal } from '@angular/core'

/**
 * A readonly Angular value signal with its underlying utility ref.
 * The `debouncer` attribute exposes the underlying Debouncer methods.
 */
export interface AngularDebouncerValue<
  TValue,
  TSelected = {},
> extends Signal<TValue> {
  /** The underlying Angular Debouncer ref for controlling execution. */
  debouncer: AngularDebouncer<(value: TValue) => void, TSelected>
}
/**
 * Creates an Angular debounced view of a source signal.
 *
 * The initial source value is available on first read. Source changes are observed by an effect and applied after the debounce delay; newer changes restart the delay.
 *
 * The returned value is a real Angular signal with the underlying utility exposed
 * on `debouncer`. Options accept a static object or reactive factory and follow
 * {@link injectDebouncer} lifecycle and provider behavior.
 *
 * @param signalToDebounce The source signal or accessor whose changes are observed.
 * @param options Core options or a reactive options factory.
 * @returns The value signal with a `debouncer` attribute.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const source = signal('initial')
 * const value = injectDebouncedValue(source, { wait: 250 })
 * source.set('updated')
 * console.log(value())
 * ```
 */
export function injectDebouncedValue<TValue>(
  signalToDebounce: () => TValue,
  options: MaybeAccessor<AngularDebouncerOptions<(value: TValue) => void>>,
): AngularDebouncerValue<TValue>
/**
 * Creates the value signal with selected state on its attached utility ref.
 * @param selector Selects reactive state exposed on the attached utility ref.
 */
export function injectDebouncedValue<TValue, TSelected>(
  signalToDebounce: () => TValue,
  options: MaybeAccessor<AngularDebouncerOptions<(value: TValue) => void>>,
  selector: (state: DebouncerState<(value: TValue) => void>) => TSelected,
): AngularDebouncerValue<TValue, TSelected>
export function injectDebouncedValue<TValue, TSelected>(
  signalToDebounce: () => TValue,
  options: MaybeAccessor<AngularDebouncerOptions<(value: TValue) => void>>,
  selector?: (state: DebouncerState<(value: TValue) => void>) => TSelected,
): AngularDebouncerValue<TValue, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectDebouncedValue)
  }

  const select = (state: DebouncerState<(value: TValue) => void>) =>
    selector ? selector(state) : {}
  const sourceValue = computed(signalToDebounce)
  const debouncedSignal = linkedSignal(() => untracked(sourceValue))
  const debouncer = injectDebouncer(
    (value: TValue) => debouncedSignal.set(value),
    options,
    select,
  )
  let initialized = false
  effect(() => {
    const value = sourceValue()
    if (!initialized) {
      initialized = true
      if (Object.is(untracked(debouncedSignal), value)) return
    }
    debouncer.maybeExecute(value)
  })
  return Object.assign(debouncedSignal.asReadonly(), {
    debouncer,
  })
}
