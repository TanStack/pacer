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
 *
 *   clearState(useDefaultState?: boolean): void {
 *     // Clear state from storage or set the default state if provided and specified to be used
 *   }
 * }
 * ```
 */
export abstract class Persister<
  TState,
  TSelected extends Partial<TState> = TState,
> {
  constructor(public readonly key: string) {}

  abstract loadState: () => TSelected | undefined
  abstract saveState: (state: TState) => void
  abstract clearState: (useDefaultState?: boolean) => void
}
