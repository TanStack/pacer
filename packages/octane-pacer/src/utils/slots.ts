import { useSelector } from '@tanstack/octane-store'
import type { ReadonlyStore, UseSelectorOptions } from '@tanstack/octane-store'

// Slot mechanics for the binding's plain-`.ts` hooks. Octane injects a
// per-call-site Symbol into calls made by compiled components; the binding
// forwards that symbol and derives a distinct sub-slot for each hook it
// composes.
const subSlotCache = new Map<symbol, Map<string, symbol>>()
const bareTagCache = new Map<string, symbol>()

export function subSlot(slot: symbol | undefined, tag: string): symbol {
  if (slot === undefined) {
    let bare = bareTagCache.get(tag)
    if (bare === undefined) {
      bare = Symbol.for(`@tanstack/octane-pacer:${tag}`)
      bareTagCache.set(tag, bare)
    }
    return bare
  }

  let byTag = subSlotCache.get(slot)
  if (byTag === undefined) {
    byTag = new Map()
    subSlotCache.set(slot, byTag)
  }

  let child = byTag.get(tag)
  if (child === undefined) {
    child = Symbol.for(`${slot.description ?? ''}:${tag}`)
    byTag.set(tag, child)
  }
  return child
}

export function splitSlot(
  args: Array<unknown>,
): [Array<unknown>, symbol | undefined] {
  const tail = args[args.length - 1]
  const slot = typeof tail === 'symbol' ? tail : undefined
  return [slot === undefined ? args : args.slice(0, -1), slot]
}

// Store's public overload hides the compiler-injected hook slot.
export const select = useSelector as <T, TSelected>(
  source: Pick<ReadonlyStore<T>, 'get' | 'subscribe'>,
  selector: (state: T) => TSelected,
  options: UseSelectorOptions<TSelected> | undefined,
  slot: symbol,
) => TSelected
