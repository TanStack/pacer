/**
 * Abstract class that defines the contract for an asynchronous state persister.
 * An async persister is responsible for saving and loading state to a storage medium using asynchronous operations.
 *
 * This is useful for scenarios where persistence involves asynchronous APIs, such as IndexedDB, remote storage, or custom async backends.
 *
 * Implementations should provide methods to load, save, and clear persisted state for a given key.
 *
 * See also: `Persister` for synchronous persister implementations.
 */
export abstract class AsyncPersister<
  TState,
  TSelected extends Partial<TState> = TState,
> {
  constructor(public readonly key: string) {}

  abstract loadState: () => TSelected | undefined
  abstract saveState: (state: TState) => void
  abstract clearState: (useDefaultState?: boolean) => void
}
