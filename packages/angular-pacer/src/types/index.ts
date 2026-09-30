export * from '@tanstack/pacer/types'

/** Options snapshot, or a factory that reads reactive values. */
export type AngularPacerOptions<TOptions> = TOptions | (() => TOptions)
