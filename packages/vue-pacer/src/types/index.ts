export * from '@tanstack/pacer/types'

/** An options object with reactive property getters, or a factory returning options. */
export type VuePacerOptions<TOptions> = TOptions | (() => TOptions)
