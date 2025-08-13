import { For, createSignal } from 'solid-js'
import clsx from 'clsx'
import { JsonTree } from '@tanstack/devtools-ui'
import { usePacerState } from './context/use-context-hooks'
import { PacerContextProvider } from './context/context-provider'
import { useStyles } from './styles/use-styles'

type StateKey =
  | 'asyncBatcherState'
  | 'asyncDebouncerState'
  | 'asyncQueuerState'
  | 'asyncRateLimiterState'
  | 'asyncThrottlerState'
  | 'batcherState'
  | 'debouncerState'
  | 'queuerState'
  | 'rateLimiterState'
  | 'throttlerState'

type UtilGroup = {
  key: StateKey
  label: string
  displayName: string
}

const UTIL_GROUPS: Array<UtilGroup> = [
  { key: 'debouncerState', label: 'Debouncers', displayName: 'Debouncer' },
  { key: 'throttlerState', label: 'Throttlers', displayName: 'Throttler' },
  { key: 'batcherState', label: 'Batchers', displayName: 'Batcher' },
  { key: 'queuerState', label: 'Queuers', displayName: 'Queuer' },
  {
    key: 'rateLimiterState',
    label: 'Rate Limiters',
    displayName: 'Rate Limiter',
  },
  {
    key: 'asyncDebouncerState',
    label: 'Async Debouncers',
    displayName: 'Async Debouncer',
  },
  {
    key: 'asyncThrottlerState',
    label: 'Async Throttlers',
    displayName: 'Async Throttler',
  },
  {
    key: 'asyncBatcherState',
    label: 'Async Batchers',
    displayName: 'Async Batcher',
  },
  {
    key: 'asyncQueuerState',
    label: 'Async Queuers',
    displayName: 'Async Queuer',
  },
  {
    key: 'asyncRateLimiterState',
    label: 'Async Rate Limiters',
    displayName: 'Async Rate Limiter',
  },
]

function Shell() {
  const styles = useStyles()
  const state = usePacerState()
  const [selectedKey, setSelectedKey] = createSignal<string | null>(null)

  // Find the selected instance
  const selectedInstance = () => {
    if (!selectedKey()) return null

    for (const group of UTIL_GROUPS) {
      const instance = state[group.key].find(
        (inst) => inst.key === selectedKey(),
      )
      if (instance) return { ...instance, type: group.displayName }
    }
    return null
  }

  return (
    <div class={styles().devtoolsPanel}>
      <div class={styles().stickyHeader}>TanStack Pacer</div>

      <div class={styles().mainContainer}>
        {/* Left Panel - Util List */}
        <div class={styles().leftPanel}>
          <div class={styles().panelHeader}>Utils</div>
          <div class={styles().utilList}>
            <For each={UTIL_GROUPS}>
              {(group) => (
                <>
                  {state[group.key].length > 0 && (
                    <div class={styles().utilGroup}>
                      <div class={styles().utilGroupHeader}>{group.label}</div>
                      <For each={state[group.key]}>
                        {(instance) => (
                          <div
                            class={clsx(
                              styles().utilRow,
                              selectedKey() === instance.key &&
                                styles().utilRowSelected,
                            )}
                            onClick={() => setSelectedKey(instance.key)}
                          >
                            <div class={styles().utilKey}>{instance.key}</div>
                            <div class={styles().utilStatus}>
                              {instance.status}
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </>
              )}
            </For>
          </div>
        </div>

        {/* Right Panel - State Details */}
        <div class={styles().rightPanel}>
          <div class={styles().panelHeader}>State Details</div>
          <div class={styles().stateDetails}>
            {(() => {
              const instance = selectedInstance()
              return instance !== null ? (
                <>
                  <div class={styles().stateHeader}>
                    <div class={styles().stateTitle}>{instance.type}</div>
                    <div class={styles().stateKey}>{instance.key}</div>
                  </div>
                  <div class={styles().stateContent}>
                    <JsonTree value={instance} />
                  </div>
                </>
              ) : (
                <div class={styles().noSelection}>
                  Select a util from the left panel to view its state
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Devtools() {
  return (
    <PacerContextProvider>
      <Shell />
    </PacerContextProvider>
  )
}
