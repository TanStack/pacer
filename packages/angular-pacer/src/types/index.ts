export * from '@tanstack/pacer/types'

/** Options with optional reactive getters, or a factory that reads reactive values. */
export type AngularPacerOptions<TOptions> = TOptions | (() => TOptions)
