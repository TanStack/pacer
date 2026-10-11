import { createMemo } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { SolidPacerOptions } from '../types'

export function createPacerOptions<TOptions extends object>(
  options: SolidPacerOptions<TOptions>,
  defaults: () => object | undefined,
): Accessor<TOptions> {
  // Evaluate only top-level properties. Function-valued options stay opaque,
  // and omitted keys retain the core's partial setOptions merge semantics.
  return createMemo(() => ({
    ...defaults(),
    ...(typeof options === 'function' ? options() : options),
  }))
}
