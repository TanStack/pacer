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

  abstract loadState: () => TState | undefined
  abstract saveState: (state: TState) => void
}
