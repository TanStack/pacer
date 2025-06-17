import type { RequiredKeys } from './types'

/**
 * Abstract class that defines the contract for a state persister implementation.
 * A persister is responsible for loading and saving state to a storage medium.
 *
 * @example
 * ```ts
 * class MyPersister extends Persister<MyState> {
 *   constructor() {
 *     super(key)
 *   }
 *
 *   loadState(): MyState | undefined {
 *     // Load state from storage
 *     return state
 *   }
 *
 *   saveState(, state: MyState): void {
 *     // Save state to storage
 *   }
 * }
 * ```
 */
export abstract class Persister<TState> {
  constructor(public readonly key: string) {}

  abstract loadState(): TState | undefined
  abstract saveState(state: TState): void
}

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
   * Optional function to customize how state is deserialized after loading from storage.
   * By default, JSON.parse is used.
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
   */
  serializer?: (state: PersistedStorage<TState>) => string
  /**
   * The browser storage implementation to use for persisting state.
   * Typically window.localStorage or window.sessionStorage.
   */
  storage: Storage
}

type DefaultOptions = RequiredKeys<
  Partial<StoragePersisterOptions<any>>,
  'deserializer' | 'serializer'
>

const defaultOptions: DefaultOptions = {
  deserializer: JSON.parse,
  serializer: JSON.stringify,
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
 *   key: 'my-rate-limiter',
 *   storage: window.localStorage,
 *   buster: 'v2',
 *   maxAge: 1000 * 60 * 60, // 1 hour
 *   onSaveState: (key, state) => console.log('State saved:', key, state),
 *   onLoadState: (key, state) => console.log('State loaded:', key, state),
 *   onLoadStateError: (key, error) => console.error('Error loading state:', key, error),
 *   onSaveStateError: (key, error) => console.error('Error saving state:', key, error)
 * })
 * const rateLimiter = new RateLimiter(fn, {
 *   persister,
 *   limit: 5,
 *   window: 1000
 * })
 * ```
 */
export class StoragePersister<TState> extends Persister<TState> {
  private _options: StoragePersisterOptions<TState> & DefaultOptions
  constructor(options: StoragePersisterOptions<TState>) {
    super(options.key)
    this._options = {
      ...defaultOptions,
      ...options,
    }
  }

  /**
   * Updates the persister options
   */
  setOptions(newOptions: Partial<StoragePersisterOptions<TState>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current persister options
   */
  getOptions(): StoragePersisterOptions<TState> {
    return this._options
  }

  saveState(state: TState): void {
    try {
      this._options.storage.setItem(
        this.key,
        this._options.serializer({
          buster: this._options.buster,
          state,
          timestamp: Date.now(),
        }),
      )
      this._options.onSaveState?.(state)
    } catch (error) {
      console.error(error)
      this._options.onSaveStateError?.(error as Error)
    }
  }

  loadState(): TState | undefined {
    const stored = this._options.storage.getItem(this.key)
    if (!stored) {
      return undefined
    }

    try {
      const parsed = this._options.deserializer(stored)
      const isValid =
        !this._options.buster || parsed.buster === this._options.buster
      const isNotExpired =
        !this._options.maxAge ||
        !parsed.timestamp ||
        Date.now() - parsed.timestamp <= this._options.maxAge

      if (!isValid || !isNotExpired) {
        return undefined
      }

      const state = parsed.state as TState
      this._options.onLoadState?.(state)
      return state
    } catch (error) {
      console.error(error)
      this._options.onLoadStateError?.(error as Error)
      return undefined
    }
  }
}
