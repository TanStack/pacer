/**
 * Interface for an async persister that can save/load state for a given type
 */
export abstract class AsyncPersister<TState> {
  constructor(public readonly key: string) {}

  abstract loadState(key: string): Promise<TState | undefined>
  abstract saveState(key: string, state: TState): Promise<void>
}
