import { pacerEventClient } from '@tanstack/pacer'
import { useStyles } from '../styles/use-styles'
import type { PacerEventName } from '@tanstack/pacer'

type ActionButtonsProps = {
  instance: any
  utilName: string
}

export function ActionButtons(props: ActionButtonsProps) {
  const styles = useStyles()
  const utilInstance = props.instance
  const utilState = utilInstance?.store?.state
  const hasPending = utilState && 'isPending' in utilState
  const hasEmpty = utilState && 'isEmpty' in utilState
  const isPending = hasPending ? !!utilState.isPending : false
  const isEmpty = hasEmpty ? utilState.isEmpty : undefined

  const hasFlush = typeof utilInstance.flush === 'function'
  const hasCancel = typeof utilInstance.cancel === 'function'
  const hasReset = typeof utilInstance.reset === 'function'
  const hasClear = typeof utilInstance.clear === 'function'
  const hasStart = typeof utilInstance.start === 'function'
  const hasStop = typeof utilInstance.stop === 'function'
  const hasStartStop = hasStart && hasStop

  const isRunning = utilState?.isRunning ?? true

  if (!hasPending && !hasFlush && !hasCancel && !hasReset && !hasClear) {
    return (
      <div class={styles().sectionEmpty}>
        No actions available for this util
      </div>
    )
  }

  const emitName = `d-${props.utilName}` as PacerEventName

  return (
    <div class={styles().actionsRow}>
      {hasPending && (
        <button
          class={styles().actionButton}
          onMouseDown={() => {
            const next = !isPending
            utilInstance.store.setState((prev: any) => ({
              ...prev,
              isPending: next,
            }))
            pacerEventClient.emit(emitName, utilInstance)
          }}
        >
          <span class={styles().actionDotBlue} />
          {isPending ? 'Restore Pending' : 'Trigger Pending'}
        </button>
      )}
      {hasFlush && (
        <button
          class={styles().actionButton}
          onMouseDown={() => {
            utilInstance.flush()
            pacerEventClient.emit(emitName, utilInstance)
          }}
          disabled={
            (props.utilName.toLowerCase().includes('debouncer') &&
              !isPending) ||
            (props.utilName.toLowerCase().includes('throttler') &&
              !isPending) ||
            (props.utilName.toLowerCase().includes('batcher') && isEmpty) ||
            (props.utilName.toLowerCase().includes('queuer') && isEmpty)
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
            pacerEventClient.emit(emitName, utilInstance)
          }}
          disabled={
            (props.utilName.toLowerCase().includes('debouncer') &&
              !isPending) ||
            (props.utilName.toLowerCase().includes('throttler') &&
              !isPending) ||
            (props.utilName.toLowerCase().includes('batcher') && isEmpty) ||
            (props.utilName.toLowerCase().includes('queuer') && isEmpty)
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
            pacerEventClient.emit(emitName, utilInstance)
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
            pacerEventClient.emit(emitName, utilInstance)
          }}
          disabled={
            (props.utilName.toLowerCase().includes('batcher') && isEmpty) ||
            (props.utilName.toLowerCase().includes('queuer') && isEmpty)
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
            if (isRunning) {
              utilInstance.stop()
            } else {
              utilInstance.start()
            }
            pacerEventClient.emit(emitName, utilInstance)
          }}
        >
          <span class={styles().actionDotPurple} />
          {isRunning ? 'Stop' : 'Start'}
        </button>
      )}
    </div>
  )
}
