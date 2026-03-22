import { emitChange } from '@tanstack/pacer'
import { useStore } from '@tanstack/solid-store'
import { useStyles } from '../styles/use-styles'
import {
  getPacerUtilStoreState,
  isPacerUtilTanStackStore,
} from '../utils/read-pacer-store-state'
import type { PacerEventName } from '@tanstack/pacer'

type ActionButtonsProps = {
  instance: any
  utilName: string
}

export function ActionButtons(props: ActionButtonsProps) {
  const styles = useStyles()
  const utilInstance = props.instance
  const store = utilInstance?.store

  const stateAccessor = isPacerUtilTanStackStore(store)
    ? useStore(store as never, (s: unknown) =>
        s !== null && s !== undefined && typeof s === 'object'
          ? (s as Record<string, unknown>)
          : {},
      )
    : () => getPacerUtilStoreState(utilInstance) as Record<string, unknown>

  const getState = () => stateAccessor()

  const hasPending = () => {
    const u = getState()
    return 'isPending' in u
  }
  const isPending = () => {
    const u = getState()
    return 'isPending' in u ? !!u.isPending : false
  }
  const isEmptyFlag = () => {
    const u = getState()
    return 'isEmpty' in u ? !!u.isEmpty : false
  }

  const hasFlush = typeof utilInstance.flush === 'function'
  const hasCancel = typeof utilInstance.cancel === 'function'
  const hasReset = typeof utilInstance.reset === 'function'
  const hasClear = typeof utilInstance.clear === 'function'
  const hasStart = typeof utilInstance.start === 'function'
  const hasStop = typeof utilInstance.stop === 'function'
  const hasStartStop = hasStart && hasStop

  const isRunning = () => {
    const u = getState()
    return 'isRunning' in u ? !!u.isRunning : true
  }

  if (!hasPending() && !hasFlush && !hasCancel && !hasReset && !hasClear) {
    return (
      <div class={styles().sectionEmpty}>
        No actions available for this util
      </div>
    )
  }

  const emitName = `d-${props.utilName}` as PacerEventName
  const utilNameLower = props.utilName.toLowerCase()

  return (
    <div class={styles().actionsRow}>
      {hasPending() && (
        <button
          class={styles().actionButton}
          onMouseDown={() => {
            const next = !isPending()
            utilInstance.store.setState((prev: any) => ({
              ...prev,
              isPending: next,
            }))
            emitChange(emitName, utilInstance)
          }}
        >
          <span class={styles().actionDotBlue} />
          {isPending() ? 'Restore Pending' : 'Trigger Pending'}
        </button>
      )}
      {hasFlush && (
        <button
          class={styles().actionButton}
          onMouseDown={() => {
            utilInstance.flush()
            emitChange(emitName, utilInstance)
          }}
          disabled={
            (utilNameLower.includes('debouncer') && !isPending()) ||
            (utilNameLower.includes('throttler') && !isPending()) ||
            (utilNameLower.includes('batcher') && isEmptyFlag()) ||
            (utilNameLower.includes('queuer') && isEmptyFlag())
          }
        >
          <span class={styles().actionDotGreen} />
          Flush
        </button>
      )}
      {hasCancel && (
        <button
          class={styles().actionButton}
          onMouseDown={() => {
            utilInstance.cancel()
            emitChange(emitName, utilInstance)
          }}
          disabled={
            (utilNameLower.includes('debouncer') && !isPending()) ||
            (utilNameLower.includes('throttler') && !isPending()) ||
            (utilNameLower.includes('batcher') && isEmptyFlag()) ||
            (utilNameLower.includes('queuer') && isEmptyFlag())
          }
        >
          <span class={styles().actionDotRed} />
          Cancel
        </button>
      )}
      {hasReset && (
        <button
          class={styles().actionButton}
          onMouseDown={() => {
            utilInstance.reset()
            emitChange(emitName, utilInstance)
          }}
        >
          <span class={styles().actionDotYellow} />
          Reset
        </button>
      )}
      {hasClear && (
        <button
          class={styles().actionButton}
          onMouseDown={() => {
            utilInstance.clear()
            emitChange(emitName, utilInstance)
          }}
          disabled={
            (utilNameLower.includes('batcher') && isEmptyFlag()) ||
            (utilNameLower.includes('queuer') && isEmptyFlag())
          }
        >
          <span class={styles().actionDotOrange} />
          Clear
        </button>
      )}
      {hasStartStop && (
        <button
          class={styles().actionButton}
          onMouseDown={() => {
            if (isRunning()) {
              utilInstance.stop()
            } else {
              utilInstance.start()
            }
            emitChange(emitName, utilInstance)
          }}
        >
          <span class={styles().actionDotPurple} />
          {isRunning() ? 'Stop' : 'Start'}
        </button>
      )}
    </div>
  )
}
