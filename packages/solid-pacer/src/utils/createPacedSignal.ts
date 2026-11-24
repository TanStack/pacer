import { createSignal } from 'solid-js'
import type { Accessor, Setter } from 'solid-js'

/**
 * The signal behind the paced `*Signal` and `*Value` primitives. It starts
 * with `seed()` and is written only by the pacer after that. The seed is read
 * in the signal's own compute, so a seed that is still loading makes the
 * signal wait instead of throwing.
 */
export function createPacedSignal<
  TValue,
  TPacer extends { maybeExecute: (value: any) => unknown },
>(
  seed: () => TValue,
  create: (set: Setter<TValue>) => TPacer,
): [Accessor<TValue>, Setter<TValue>, TPacer] {
  let seeded = false
  const [value, setValue] = createSignal<TValue>(
    (prev) => {
      if (seeded) return prev as TValue
      const initial = seed()
      seeded = true
      return initial
    },
    // Written from timers and from effects (the *Value primitives).
    { ownedWrite: true },
  )
  const pacer = create(setValue)
  return [
    value,
    ((next: unknown) => pacer.maybeExecute(next)) as Setter<TValue>,
    pacer,
  ]
}
