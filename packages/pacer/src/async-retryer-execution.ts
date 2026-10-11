// Internal execution protocol shared by AsyncRetryer and its parent utilities.
// Keep this module out of the package's supported entry points.
export const executeWithOutcome = Symbol('executeWithOutcome')

export type AsyncExecutionOutcome<TResult> =
  | { status: 'success'; result: TResult }
  | { status: 'error'; error: Error | undefined; shouldThrow: boolean }
  | { status: 'disabled' | 'aborted' }
