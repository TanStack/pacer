import { createMemo } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { SolidPacerOptions } from '../types'

export function createPacerOptions<TOptions extends object>(
  options: SolidPacerOptions<TOptions>,
  defaults: object | undefined,
): Accessor<TOptions> {
  if (typeof options === 'function') {
    return createMemo(() => ({ ...defaults, ...options() }))
  }
  const initialOptions = { ...defaults, ...options }
  return () => initialOptions
}
