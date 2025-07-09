import { Persister } from './persister'
import type { RequiredKeys } from './types'

export interface PersistedStorage<TState> {
  buster?: string
  state: TState | undefined
  timestamp: number
}

/**
 * Configuration options for creating a browser-based state persister.
 *
 * The persister can use either localStorage (persists across browser sessions) or
 * sessionStorage (cleared when browser tab/window closes) to store serialized state.
 */
export interface StoragePersisterOptions<TState> {
  /**
   * A version string used to invalidate cached state. When changed, any existing
   * stored state will be considered invalid and cleared.
   */
  buster?: string
  /**
   * The default state to use if no state is found in storage.
   */
  defaultState?: TState
  /**
   * Optional function to customize how state is deserialized after loading from storage.
   * By default, JSON.parse is used.
   *
   * Optionally, consider using SuperJSON for better deserialization of complex objects. See https://github.com/flightcontrolhq/superjson
   */
  deserializer?: (state: string) => PersistedStorage<TState>
  /**
   * Unique identifier used as the storage key for persisting state.
   */
  key: string
  /**
   * Maximum age in milliseconds before stored state is considered expired.
   * When exceeded, the state will be cleared and treated as if it doesn't exist.
   */
  maxAge?: number
  /**
   * Optional callback that runs after state is successfully loaded.
   */
  onLoadState?: (state: TState | undefined) => void
  /**
   * Optional callback that runs after state is unable to be loaded.
   */
  onLoadStateError?: (error: Error) => void
  /**
   * Optional callback that runs after state is successfully saved.
   */
  onSaveState?: (state: TState) => void
  /**
   * Optional callback that runs after state is unable to be saved.
   * For example, if the storage is full (localStorage >= 5MB)
   */
  onSaveStateError?: (error: Error) => void
  /**
   * Optional function to customize how state is serialized before saving to storage.
   * By default, JSON.stringify is used.
   *
   * Optionally, consider using SuperJSON for better serialization of complex objects. See https://github.com/flightcontrolhq/superjson
   */
  serializer?: (state: PersistedStorage<TState>) => string
  /**
   * Optional function to filter which parts of the state are persisted and loaded, or to otherwise transform the state before saving or loading.
   * When provided, only the filtered state will be saved to storage and returned when loading.
   * This is useful for excluding sensitive or temporary data from persistence.
   *
   * Note: Don't use this to replace the serialization. Use the `serializer` option instead for that.
   */
  stateTransform?: (state: TState) => Partial<TState>
  /**
   * The browser storage implementation to use for persisting state.
   * Typically window.localStorage or window.sessionStorage.
   *
   * Defaults to window.localStorage.
   */
  storage?: Storage
}

type DefaultOptions = RequiredKeys<
  Partial<StoragePersisterOptions<any>>,
  'deserializer' | 'serializer' | 'storage'
>

const defaultOptions: DefaultOptions = {
  deserializer: JSON.parse,
  serializer: JSON.stringify,
  storage: window.localStorage,
}

/**
 * A persister that saves state to browser local/session storage.
 *
 * The persister can use either localStorage (persists across browser sessions) or
 * sessionStorage (cleared when browser tab/window closes). State is automatically
 * serialized to JSON when saving and deserialized when loading.
 *
 * Optionally, a `buster` string can be provided to force cache busting by storing it in the value.
 * Optionally, a `maxAge` (in ms) can be provided to expire the stored state after a certain duration.
 * Optionally, callbacks can be provided to run after state is saved or loaded.
 *
 * @example
 * ```ts
 * const persister = new StoragePersister({
 *   key: 'my-rate-limiter', // required
 *   storage: window.localStorage,
 *   buster: 'v2',
 *   maxAge: 1000 * 60 * 60, // 1 hour
 *   stateTransform: (state) => ({
 *     // Only persist specific parts of the state
 *     count: state.count,
 *     lastReset: state.lastReset,
 *     // Exclude sensitive or temporary data
 *   }),
 *   onSaveState: (key, state) => console.log('State saved:', key, state),
 *   onLoadState: (key, state) => console.log('State loaded:', key, state),
 *   onLoadStateError: (key, error) => console.error('Error loading state:', key, error),
 *   onSaveStateError: (key, error) => console.error('Error saving state:', key, error)
 * })
 * ```
 */
export class StoragePersister<TState> extends Persister<TState> {
  options: StoragePersisterOptions<TState> & DefaultOptions

  constructor(initialOptions: StoragePersisterOptions<TState>) {
    super(initialOptions.key)
    this.options = {
      ...defaultOptions,
      ...initialOptions,
    }
  }

  /**
   * Updates the persister options
   */
  setOptions = (newOptions: Partial<StoragePersisterOptions<TState>>): void => {
    this.options = { ...this.options, ...newOptions }
  }

  /**
   * Saves the state to storage
   */
  saveState = (state: TState): void => {
    try {
      const stateToSave = this.options.stateTransform
        ? this.options.stateTransform(state)
        : state
      this.options.storage.setItem(
        this.key,
        this.options.serializer({
          buster: this.options.buster,
          state: stateToSave,
          timestamp: Date.now(),
        }),
      )
      this.options.onSaveState?.(state)
    } catch (error) {
      console.error(error)
      this.options.onSaveStateError?.(error as Error)
    }
  }

  /**
   * Loads the state from storage
   */
  loadState = (): TState | undefined => {
    const stored = this.options.storage.getItem(this.key)
    if (!stored) {
      return undefined
    }

    try {
      const parsed = this.options.deserializer(stored)
      const isValid =
        !this.options.buster || parsed.buster === this.options.buster
      const isNotExpired =
        !this.options.maxAge ||
        !parsed.timestamp ||
        Date.now() - parsed.timestamp <= this.options.maxAge

      if (!isValid || !isNotExpired) {
        // clear the item from storage
        this.options.storage.removeItem(this.key)
        return undefined
      }

      const state = parsed.state as TState
      this.options.onLoadState?.(state)
      return state
    } catch (error) {
      console.error(error)
      this.options.onLoadStateError?.(error as Error)
      return undefined
    }
  }

  /**
   * Clears the state from storage or sets the default state if provided and specified to be used
   */
  clearState = (useDefaultState: boolean = false): void => {
    if (useDefaultState) {
      this.saveState(this.options.defaultState)
    } else {
      this.options.storage.removeItem(this.key)
    }
  }
}
