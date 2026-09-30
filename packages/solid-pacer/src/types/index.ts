export * from '@tanstack/pacer/types'

/** Options snapshot, or a factory that reads reactive values. */
export type SolidPacerOptions<TOptions> = TOptions | (() => TOptions)
