export * from '@tanstack/pacer/types'

/** A value or reactive factory used for scoped defaults. */
export type EmberPacerOptions<TOptions> = TOptions | (() => TOptions)
