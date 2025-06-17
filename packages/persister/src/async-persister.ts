/**
 * Interface for an async persister that can save/load state for a given type
 */
export abstract class AsyncPersister<TState> {
  constructor(public readonly key: string) {}

  abstract loadState(): Promise<TState | undefined>
  abstract saveState(state: TState): Promise<void>
}
