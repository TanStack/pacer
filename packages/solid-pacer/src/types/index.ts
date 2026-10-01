export * from '@tanstack/pacer/types'

/** An options object with optional reactive getters, or an options factory. */
export type SolidPacerOptions<TOptions> = TOptions | (() => TOptions)
