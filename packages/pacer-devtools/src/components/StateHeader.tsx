import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import { Show, createSignal, onCleanup, onMount } from 'solid-js'
import { shallow, useSelector } from '@tanstack/solid-store'
import { useStyles } from '../styles/use-styles'
import {
  getPacerUtilStoreState,
  isPacerUtilTanStackStore,
} from '../utils/read-pacer-store-state'

dayjs.extend(relativeTime)

type StateHeaderProps = {
  selectedInstance: () => { instance: any; type: string } | null
  utilState: () => { lastUpdatedByKey: Record<string, number> }
}

function reductionFromState(
  entry: { type: string },
  state: Record<string, unknown> | null | undefined,
): number {
  if (!state) return 0

  const isAsync = entry.type.toLowerCase().includes('async')
  const completedExecutions = isAsync
    ? Number(state.settleCount) || 0
    : Number(state.executionCount) || 0

  if (entry.type.toLowerCase().includes('batcher')) {
    const totalItemsProcessed = Number(state.totalItemsProcessed) || 0
    if (totalItemsProcessed === 0) return 0
    return Math.round(
      ((totalItemsProcessed - completedExecutions) / totalItemsProcessed) * 100,
    )
  }

  let requestCount = 0

  if (state.maybeExecuteCount !== undefined) {
    requestCount = Number(state.maybeExecuteCount) || 0
  } else if (state.addItemCount !== undefined) {
    requestCount = Number(state.addItemCount) || 0
  } else {
    return 0
  }

  if (requestCount === 0) return 0

  const reduction = requestCount - completedExecutions
  return Math.round((reduction / requestCount) * 100)
}

function StateHeaderInner(props: {
  entry: { instance: any; type: string }
  styles: ReturnType<ReturnType<typeof useStyles>>
  now: () => number
  utilState: () => { lastUpdatedByKey: Record<string, number> }
}) {
  const key = props.entry.instance.key as string
  const updatedAt = () => props.utilState().lastUpdatedByKey[key] ?? Date.now()

  const getRelativeTime = () => {
    const at = updatedAt()
    const diffMs = props.now() - at
    const diffSeconds = Math.floor(diffMs / 1000)

    if (diffSeconds < 60) {
      return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`
    }

    return dayjs(at).fromNow()
  }

  const store = props.entry.instance?.store
  const stateAccessor = isPacerUtilTanStackStore(store)
    ? useSelector(
        store as never,
        (s: unknown) =>
          s !== null && s !== undefined && typeof s === 'object'
            ? (s as Record<string, unknown>)
            : {},
        { compare: shallow },
      )
    : () =>
        getPacerUtilStoreState(props.entry.instance) as Record<string, unknown>

  const reductionPercentage = () =>
    reductionFromState(props.entry, stateAccessor())

  return (
    <div class={props.styles.stateHeader}>
      <div class={props.styles.stateTitle}>{props.entry.type}</div>
      <div class={props.styles.stateHeaderMeta}>
        <div class={props.styles.infoGrid}>
          <div class={props.styles.infoLabel}>Key</div>
          <div class={props.styles.infoValueMono}>{key}</div>
          <div class={props.styles.infoLabel}>Last Updated</div>
          <div class={props.styles.infoValueMono}>
            {new Date(updatedAt()).toLocaleTimeString()} ({getRelativeTime()})
          </div>
        </div>
        <div
          class={`${props.styles.infoValueMono} ${props.styles.stateHeaderReduction}`}
        >
          {reductionPercentage()}% reduction
        </div>
      </div>
    </div>
  )
}

export function StateHeader(props: StateHeaderProps) {
  const styles = useStyles()
  const [now, setNow] = createSignal(Date.now())

  onMount(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    onCleanup(() => {
      clearInterval(interval)
    })
  })

  return (
    <Show when={props.selectedInstance()}>
      {(entry) => (
        <StateHeaderInner
          entry={entry()}
          styles={styles()}
          now={now}
          utilState={props.utilState}
        />
      )}
    </Show>
  )
}
