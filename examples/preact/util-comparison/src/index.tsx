import { useState } from 'preact/hooks'
import { render } from 'preact'
import type { JSX } from 'preact'
import { useDebouncer } from '@tanstack/preact-pacer/debouncer'
import { useThrottler } from '@tanstack/preact-pacer/throttler'
import { useRateLimiter } from '@tanstack/preact-pacer/rate-limiter'
import { QueuerState, useQueuer } from '@tanstack/preact-pacer/queuer'
import { BatcherState, useBatcher } from '@tanstack/preact-pacer/batcher'
import { pacerDevtoolsPlugin } from '@tanstack/preact-pacer-devtools'
import { TanStackDevtools } from '@tanstack/preact-devtools'

function ComparisonApp() {
  const [currentValue, setCurrentValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // State for each utility
  const [debouncedValue, setDebouncedValue] = useState(50)
  const [throttledValue, setThrottledValue] = useState(50)
  const [rateLimitedValue, setRateLimitedValue] = useState(50)
  const [queuedValue, setQueuedValue] = useState(50)
  const [batchedValue, setBatchedValue] = useState(50)

  // Initialize each utility
  const debouncer = useDebouncer(
    setDebouncedValue,
    {
      key: 'my-debouncer',
      wait: 600,
    },
    // Alternative to debouncer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  const throttler = useThrottler(
    setThrottledValue,
    {
      key: 'my-throttler',
      wait: 600,
    },
    // Alternative to throttler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  const rateLimiter = useRateLimiter(
    setRateLimitedValue,
    {
      key: 'my-rate-limiter',
      limit: 20,
      window: 2000,
      windowType: 'sliding',
    },
    // Alternative to rateLimiter.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  const queuer = useQueuer(
    setQueuedValue,
    {
      key: 'my-queuer',
      wait: 100,
      maxSize: 50,
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  const batcher = useBatcher(
    (items: Array<number>) => {
      // Use the last item in the batch as the displayed value
      if (items.length > 0) {
        setBatchedValue(items[items.length - 1])
      }
    },
    {
      key: 'my-batcher',
      wait: 600,
      maxSize: 5,
    },
    // Alternative to batcher.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleRangeChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = parseInt(e.currentTarget.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)

    // Trigger each utility
    debouncer.maybeExecute(newValue)
    throttler.maybeExecute(newValue)
    rateLimiter.maybeExecute(newValue)
    queuer.addItem(newValue)
    batcher.addItem(newValue)
  }

  // Helper function to determine sync status
  // Note: This function will be called from within Subscribe HOCs, so it receives state as parameter
  function getSyncStatus(
    processedValue: number,
    utilityName: string,
    utilityState?: any,
  ) {
    const isOutOfSync = processedValue !== currentValue
    const isPending =
      (utilityName === 'Debouncer' && utilityState?.status === 'pending') ||
      (utilityName === 'Throttler' && utilityState?.status === 'pending') ||
      (utilityName === 'Queuer' && utilityState?.status === 'running') ||
      (utilityName === 'Batcher' && utilityState?.status === 'pending')

    // Tooltip explanations for why certain utilities become out of sync
    const getTooltip = () => {
      if (!isOutOfSync) return undefined

      switch (utilityName) {
        case 'Rate Limiter':
          return isPending
            ? 'Rate limiter is processing within limits'
            : 'Rate limiters reject executions when the limit is exceeded. Rejected calls are discarded entirely and never processed, causing the value to lag behind rapid changes.'
        case 'Queuer':
          return isPending
            ? 'Queuer is processing items from the queue'
            : 'Queuers reject new items when their buffer is full. If items are added faster than they can be processed, the buffer overflows and newer items are dropped.'
        default:
          return undefined
      }
    }

    return {
      isOutOfSync,
      isPending,
      statusText: isOutOfSync
        ? isPending
          ? 'Processing...'
          : 'Out of sync'
        : 'Synced',
      tooltip: getTooltip(),
    }
  }

  // Utility metadata (without state - state will be accessed via Subscribe HOCs)
  const utilityMetadata = [
    {
      name: 'Debouncer',
      value: debouncedValue,
      description: `Delays execution until after ${debouncer.options.wait}ms of inactivity`,
      color: '#3b82f6', // blue
      flush: () => debouncer.flush(),
      util: debouncer,
    },
    {
      name: 'Throttler',
      value: throttledValue,
      description: `Limits execution to once every ${throttler.options.wait}ms`,
      color: '#0891b2', // cyan
      flush: () => throttler.flush(),
      util: throttler,
    },
    {
      name: 'Rate Limiter',
      value: rateLimitedValue,
      description: `Allows max ${rateLimiter.options.limit} executions per ${rateLimiter.options.window}ms window`,
      color: '#ea580c', // orange
      util: rateLimiter,
    },
    {
      name: 'Queuer',
      value: queuedValue,
      description: `Processes items sequentially with ${queuer.options.wait}ms delay`,
      color: '#db2777', // pink
      flush: () => queuer.flush(),
      util: queuer,
    },
    {
      name: 'Batcher',
      value: batchedValue,
      description: `Processes in batches of ${batcher.options.maxSize} or after ${batcher.options.wait}ms`,
      color: '#8b5cf6', // purple
      flush: () => batcher.flush(),
      util: batcher,
    },
  ] as const

  return (
    <div
      style={{
        padding: '12px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '100%',
      }}
    >
      <h1 style={{ fontSize: '1.5em', marginBottom: '15px' }}>
        TanStack Pacer Utilities Comparison
      </h1>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2em', marginBottom: '10px' }}>
          Instant Slider (Move this slider to see the utilities in action)
        </h2>
        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>Current Value: {currentValue}</strong>
            <input
              max="100"
              min="0"
              onInput={handleRangeChange}
              style={{ width: '100%', margin: '8px 0' }}
              type="range"
              value={currentValue}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Total Interactions:</strong> {instantExecutionCount}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          marginBottom: '30px',
        }}
      >
        {utilityMetadata.map((utility) => (
          <utility.util.Subscribe
            key={utility.name}
            selector={(state) => state}
          >
            {(state) => {
              const syncStatus = getSyncStatus(
                utility.value,
                utility.name,
                state,
              )
              return (
                <div
                  style={{
                    border: `2px solid ${utility.color}`,
                    borderRadius: '6px',
                    padding: '10px',
                    backgroundColor: syncStatus.isPending
                      ? 'rgba(254, 249, 195, 0.4)' // yellowish if pending
                      : syncStatus.isOutOfSync
                        ? 'rgba(254, 226, 226, 0.4)' // reddish if out of sync
                        : 'rgba(209, 250, 229, 0.4)', // greenish if synced
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <h3
                    style={{
                      color: utility.color,
                      margin: '0 0 8px 0',
                      fontSize: '1.1em',
                    }}
                  >
                    {utility.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.85em',
                      color: '#666',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4',
                    }}
                  >
                    {utility.description}
                  </p>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.9em' }}>
                        Value: {utility.value}
                      </strong>
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      {syncStatus.isOutOfSync ? (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: syncStatus.isPending ? '#f59e0b' : '#ef4444',
                            fontSize: '0.8em',
                            cursor: syncStatus.tooltip ? 'help' : 'default',
                          }}
                          title={syncStatus.tooltip}
                        >
                          <WarningIcon size={12} />
                          {syncStatus.statusText}
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: '#10b981',
                            fontSize: '0.8em',
                          }}
                        >
                          <SuccessIcon size={12} />
                          {syncStatus.statusText}
                        </span>
                      )}
                    </div>
                    <input
                      onClick={() =>
                        alert(
                          'These sliders are read-only. Move the main slider at the top',
                        )
                      }
                      type="range"
                      min="0"
                      max="100"
                      value={utility.value}
                      readOnly
                      style={{
                        width: '100%',
                        margin: '2px 0',
                        accentColor: utility.color,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: '0.8em',
                      marginBottom: '12px',
                      lineHeight: '1.3',
                    }}
                  >
                    <div>
                      <strong>Executions:</strong> {state.executionCount}
                    </div>
                    <div>
                      <strong>Reduction:</strong>{' '}
                      {instantExecutionCount === 0
                        ? '0'
                        : Math.round(
                            ((instantExecutionCount - state.executionCount) /
                              instantExecutionCount) *
                              100,
                          )}
                      %
                    </div>
                    {utility.name === 'Rate Limiter' && (
                      <div>
                        <strong>Rejections:</strong>{' '}
                        {(state as any).rejectionCount}
                      </div>
                    )}
                    {utility.name === 'Queuer' && (
                      <>
                        <div>
                          <strong>Queue Size:</strong>{' '}
                          {(state as QueuerState<number>).size}
                        </div>
                      </>
                    )}
                    {utility.name === 'Batcher' && (
                      <>
                        <div>
                          <strong>Batch Size:</strong>{' '}
                          {(state as BatcherState<number>).size}
                        </div>
                        <div>
                          <strong>Items Processed:</strong>{' '}
                          {(state as any).totalItemsProcessed}
                        </div>
                      </>
                    )}
                    <div>
                      <strong>Status:</strong> {state.status}
                    </div>
                  </div>
                  {'flush' in utility &&
                    typeof utility.flush === 'function' && (
                      <button
                        onClick={utility.flush}
                        style={{
                          backgroundColor: utility.color,
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85em',
                          width: '100%',
                        }}
                      >
                        Flush
                      </button>
                    )}
                </div>
              )
            }}
          </utility.util.Subscribe>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2em', marginBottom: '10px' }}>
          Detailed States
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '8px',
          }}
        >
          {utilityMetadata.map((utility) => (
            <utility.util.Subscribe
              key={utility.name}
              selector={(state) => state}
            >
              {(state) => (
                <div>
                  <h4
                    style={{
                      color: utility.color,
                      margin: '0 0 5px 0',
                      fontSize: '0.9em',
                    }}
                  >
                    {utility.name} State
                  </h4>
                  <pre
                    style={{
                      fontSize: '0.7em',
                      backgroundColor: '#f5f5f5',
                      padding: '8px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '500px',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(state, null, 2)}
                  </pre>
                </div>
              )}
            </utility.util.Subscribe>
          ))}
        </div>
      </div>
      <TanStackDevtools
        eventBusConfig={{
          debug: false,
        }}
        plugins={[pacerDevtoolsPlugin()]}
      />
    </div>
  )
}

const root = document.getElementById('root')!
render(<ComparisonApp />, root)

// Warning icon SVG
const WarningIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

// Success icon SVG
const SuccessIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </svg>
)
