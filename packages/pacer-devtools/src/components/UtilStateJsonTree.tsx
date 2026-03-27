import { JsonTree } from '@tanstack/devtools-ui'
import { useStore } from '@tanstack/solid-store'
import {
  getPacerUtilStoreState,
  isPacerUtilTanStackStore,
} from '../utils/read-pacer-store-state'
import type { JSX } from 'solid-js'

type UtilStateJsonTreeProps = {
  instance: any
}

/**
 * Subscribes to the util's TanStack Store so the tree updates live (same
 * idea as {@link UtilList} status). A plain snapshot would only refresh when the
 * devtools shell re-renders, which does not happen on nested store updates.
 */
export function UtilStateJsonTree(props: UtilStateJsonTreeProps): JSX.Element {
  const store = props.instance?.store
  if (isPacerUtilTanStackStore(store)) {
    const snapshot = useStore(store as never, (s: unknown) => s)
    return <JsonTree value={snapshot()} />
  }
  return <JsonTree value={getPacerUtilStoreState(props.instance)} />
}
