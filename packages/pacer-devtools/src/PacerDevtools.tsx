import { For, createMemo, createSignal } from 'solid-js'
import clsx from 'clsx'
import { JsonTree } from '@tanstack/devtools-ui'
import {
  PacerContextProvider,
  usePacerDevtoolsState,
} from './PacerContextProvider'
import { useStyles } from './styles/use-styles'

type StateKey =
  | 'asyncBatchers'
  | 'asyncDebouncers'
  | 'asyncQueuers'
  | 'asyncRateLimiters'
  | 'asyncThrottlers'
  | 'batchers'
  | 'debouncers'
  | 'queuers'
  | 'rateLimiters'
  | 'throttlers'

type UtilGroup = {
  key: StateKey
  label: string
  displayName: string
}

const UTIL_GROUPS: Array<UtilGroup> = [
  { key: 'debouncers', label: 'Debouncers', displayName: 'Debouncer' },
  { key: 'throttlers', label: 'Throttlers', displayName: 'Throttler' },
  { key: 'batchers', label: 'Batchers', displayName: 'Batcher' },
  { key: 'queuers', label: 'Queuers', displayName: 'Queuer' },
  {
    key: 'rateLimiters',
    label: 'Rate Limiters',
    displayName: 'Rate Limiter',
  },
  {
    key: 'asyncDebouncers',
    label: 'Async Debouncers',
    displayName: 'Async Debouncer',
  },
  {
    key: 'asyncThrottlers',
    label: 'Async Throttlers',
    displayName: 'Async Throttler',
  },
  {
    key: 'asyncBatchers',
    label: 'Async Batchers',
    displayName: 'Async Batcher',
  },
  {
    key: 'asyncQueuers',
    label: 'Async Queuers',
    displayName: 'Async Queuer',
  },
  {
    key: 'asyncRateLimiters',
    label: 'Async Rate Limiters',
    displayName: 'Async Rate Limiter',
  },
]

function Shell() {
  const styles = useStyles()
  const state = usePacerDevtoolsState()
  const [selectedKey, setSelectedKey] = createSignal<string | null>(null)
  const getGroupItems = (key: StateKey) =>
    (state as unknown as Record<StateKey, Array<any>>)[key]

  // Find the selected instance
  const selectedInstance = createMemo(() => {
    const key = selectedKey()
    if (!key) return null
    for (const group of UTIL_GROUPS) {
      const instance = getGroupItems(group.key).find((inst) => inst.key === key)
      if (instance) return { instance, type: group.displayName }
    }
    return null
  })

  const getStatus = (inst: any) => {
    try {
      return inst.store?.state?.status ?? 'unknown'
    } catch {
      return 'unknown'
    }
  }

  return (
    <div class={styles().devtoolsPanel}>
      <div class={styles().stickyHeader}>TanStack Pacer</div>

      <div class={styles().mainContainer}>
        {/* Left Panel - Util List */}
        <div class={styles().leftPanel}>
          <div class={styles().utilList}>
            <For each={UTIL_GROUPS}>
              {(group) => (
                <>
                  {getGroupItems(group.key).length > 0 && (
                    <div class={styles().utilGroup}>
                      <div class={styles().utilGroupHeader}>{group.label}</div>
                      <For each={getGroupItems(group.key)}>
                        {(instance) => (
                          <div
                            class={clsx(
                              styles().utilRow,
                              selectedKey() === instance.key &&
                                styles().utilRowSelected,
                            )}
                            onClick={() => setSelectedKey(instance.key ?? null)}
                          >
                            <div class={styles().utilKey}>{instance.key}</div>
                            <div class={styles().utilStatus}>
                              {getStatus(instance)}
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
          <div class={styles().panelHeader}>Details</div>
          <div class={styles().stateDetails}>
            {(() => {
              const entry = selectedInstance()
              return entry !== null ? (
                <>
                  <div class={styles().stateHeader}>
                    <div class={styles().stateTitle}>{entry.type}</div>
                    <div class={styles().infoGrid}>
                      <div class={styles().infoLabel}>Key</div>
                      <div class={styles().infoValueMono}>
                        {entry.instance.key}
                      </div>
                      <div class={styles().infoLabel}>Last Updated</div>
                      <div class={styles().infoValueMono}>
                        {new Date(
                          (state.lastUpdatedByKey as any)[entry.instance.key] ??
                            Date.now(),
                        ).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div class={styles().detailsGrid}>
                    <div class={styles().detailSection}>
                      <div class={styles().detailSectionHeader}>Actions</div>
                      {(() => {
                        const inst: any = entry.instance
                        const state = inst?.store?.state
                        const hasPending = state && 'isPending' in state
                        const hasEmpty = state && 'isEmpty' in state
                        const isPending = hasPending ? !!state.isPending : false
                        const isEmpty = hasEmpty ? state.isEmpty : undefined

                        // Check which methods are available
                        const hasFlush = typeof inst.flush === 'function'
                        const hasCancel = typeof inst.cancel === 'function'
                        const hasReset = typeof inst.reset === 'function'
                        const hasClear = typeof inst.clear === 'function'

                        // Determine if this is a debouncer/throttler (has isPending)
                        const isDebounceThrottleLike = hasPending

                        // No actions if no methods available
                        if (
                          !hasPending &&
                          !hasFlush &&
                          !hasCancel &&
                          !hasReset &&
                          !hasClear
                        ) {
                          return (
                            <div class={styles().sectionEmpty}>
                              No actions available for this util
                            </div>
                          )
                        }

                        const togglePending = () => {
                          const next = !isPending
                          inst.store.setState((prev: any) => ({
                            ...prev,
                            isPending: next,
                          }))
                        }

                        return (
                          <div class={styles().actionsRow}>
                            {hasPending && (
                              <button
                                class={styles().actionButton}
                                onClick={() => {
                                  togglePending()
                                  inst._emit()
                                }}
                              >
                                <span class={styles().actionDotBlue} />
                                {isPending
                                  ? 'Restore Pending'
                                  : 'Trigger Pending'}
                              </button>
                            )}
                            {hasFlush && (
                              <button
                                class={styles().actionButton}
                                onClick={() => {
                                  inst.flush()
                                  inst._emit()
                                }}
                                disabled={
                                  isDebounceThrottleLike ? !isPending : isEmpty
                                }
                              >
                                <span class={styles().actionDotGreen} />
                                Flush
                              </button>
                            )}
                            {hasCancel && (
                              <button
                                class={styles().actionButton}
                                onClick={() => {
                                  inst.cancel()
                                  inst._emit()
                                }}
                                disabled={
                                  isDebounceThrottleLike ? !isPending : false
                                }
                              >
                                <span class={styles().actionDotRed} />
                                Cancel
                              </button>
                            )}
                            {hasReset && (
                              <button
                                class={styles().actionButton}
                                onClick={() => {
                                  inst.reset()
                                  inst._emit()
                                }}
                              >
                                <span class={styles().actionDotYellow} />
                                Reset
                              </button>
                            )}
                            {hasClear && (
                              <button
                                class={styles().actionButton}
                                onClick={() => {
                                  inst.clear()
                                  inst._emit()
                                }}
                                disabled={isEmpty}
                              >
                                <span class={styles().actionDotOrange} />
                                Clear
                              </button>
                            )}
                          </div>
                        )
                      })()}
                    </div>

                    <div class={styles().detailSection}>
                      <div class={styles().detailSectionHeader}>Options</div>
                      <div class={styles().stateContent}>
                        <JsonTree value={entry.instance.options} />
                      </div>
                    </div>

                    <div class={styles().detailSection}>
                      <div class={styles().detailSectionHeader}>State</div>
                      <div class={styles().stateContent}>
                        <JsonTree value={entry.instance.store?.state} />
                      </div>
                    </div>
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

export default function PacerDevtools() {
  return (
    <PacerContextProvider>
      <Shell />
    </PacerContextProvider>
  )
}
