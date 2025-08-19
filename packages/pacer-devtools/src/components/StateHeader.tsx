import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { useStyles } from '../styles/use-styles'

dayjs.extend(relativeTime)

type StateHeaderProps = {
  selectedInstance: () => { instance: any; type: string } | null
  lastUpdatedByKey: () => Record<string, number>
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

  const entry = props.selectedInstance()
  if (!entry) return null

  const key = entry.instance.key as string
  const updatedAt = props.lastUpdatedByKey()[key] ?? Date.now()

  const getRelativeTime = () => {
    const diffMs = now() - updatedAt
    const diffSeconds = Math.floor(diffMs / 1000)

    if (diffSeconds < 60) {
      return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`
    }

    return dayjs(updatedAt).fromNow()
  }

  const getReductionPercentage = () => {
    const state = entry.instance.store?.state || entry.instance.state

    if (!state) return 0

    // Use settleCount for async utilities, executionCount for sync utilities
    const isAsync = entry.type.toLowerCase().includes('async')
    const completedExecutions = isAsync
      ? state.settleCount || 0
      : state.executionCount || 0

    // For batchers, calculate reduction based on items processed vs executions
    if (entry.type.toLowerCase().includes('batcher')) {
      const totalItemsProcessed = state.totalItemsProcessed || 0
      if (totalItemsProcessed === 0) return 0
      return Math.round(
        ((totalItemsProcessed - completedExecutions) / totalItemsProcessed) *
          100,
      )
    }

    // For other utilities, calculate reduction based on request tracking
    let requestCount = 0

    if (state.maybeExecuteCount !== undefined) {
      requestCount = state.maybeExecuteCount
    } else if (state.addItemCount !== undefined) {
      requestCount = state.addItemCount
    } else {
      // For utilities that don't track requests, show 0%
      return 0
    }

    if (requestCount === 0) return 0

    const reduction = requestCount - completedExecutions
    return Math.round((reduction / requestCount) * 100)
  }

  const reductionPercentage = getReductionPercentage()

  return (
    <div class={styles().stateHeader}>
      <div class={styles().stateTitle}>{entry.type}</div>
      <div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
        <div class={styles().infoGrid}>
          <div class={styles().infoLabel}>Key</div>
          <div class={styles().infoValueMono}>{key}</div>
          <div class={styles().infoLabel}>Last Updated</div>
          <div class={styles().infoValueMono}>
            {new Date(updatedAt).toLocaleTimeString()} ({getRelativeTime()})
          </div>
        </div>
        <div
          class={styles().infoValueMono}
          style={{ 'margin-left': 'auto', 'font-weight': 'bold' }}
        >
          {reductionPercentage}% reduction
        </div>
      </div>
    </div>
  )
}
