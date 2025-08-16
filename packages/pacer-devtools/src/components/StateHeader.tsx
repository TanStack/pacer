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

  return (
    <div class={styles().stateHeader}>
      <div class={styles().stateTitle}>{entry.type}</div>
      <div class={styles().infoGrid}>
        <div class={styles().infoLabel}>Key</div>
        <div class={styles().infoValueMono}>{key}</div>
        <div class={styles().infoLabel}>Last Updated</div>
        <div class={styles().infoValueMono}>
          {new Date(updatedAt).toLocaleTimeString()} ({getRelativeTime()})
        </div>
      </div>
    </div>
  )
}
