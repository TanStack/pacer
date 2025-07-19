import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncer } from '@tanstack/react-pacer/debouncer'
import { useThrottler } from '@tanstack/react-pacer/throttler'
import { useRateLimiter } from '@tanstack/react-pacer/rate-limiter'
import { useQueuer } from '@tanstack/react-pacer/queuer'
import { useBatcher } from '@tanstack/react-pacer/batcher'

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
      wait: 600,
    },
    (state) => state,
  )

  const throttler = useThrottler(
    setThrottledValue,
    {
      wait: 600,
    },
    (state) => state,
  )

  const rateLimiter = useRateLimiter(
    setRateLimitedValue,
    {
      limit: 20,
      window: 2000,
      windowType: 'sliding',
    },
    (state) => state,
  )

  const queuer = useQueuer(
    setQueuedValue,
    {
      wait: 100,
      maxSize: 50,
    },
    (state) => state,
  )

  const batcher = useBatcher(
    (items: Array<number>) => {
      // Use the last item in the batch as the displayed value
      if (items.length > 0) {
        setBatchedValue(items[items.length - 1])
      }
    },
    {
      wait: 600,
      maxSize: 5,
    },
    (state) => state,
  )

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
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
  function getSyncStatus(processedValue: number, utilityName: string) {
    const isOutOfSync = processedValue !== currentValue
    const isPending =
      (utilityName === 'Debouncer' && debouncer.state.status === 'pending') ||
      (utilityName === 'Throttler' && throttler.state.status === 'pending') ||
      (utilityName === 'Queuer' && queuer.state.status === 'running') ||
      (utilityName === 'Batcher' && batcher.state.status === 'pending')

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

  const utilityData = [
    {
      name: 'Debouncer',
      value: debouncedValue,
      state: debouncer.state,
      description: `Delays execution until after ${debouncer.options.wait}ms of inactivity`,
      color: '#3b82f6', // blue
      flush: () => debouncer.flush(),
    },
    {
      name: 'Throttler',
      value: throttledValue,
      state: throttler.state,
      description: `Limits execution to once every ${throttler.options.wait}ms`,
      color: '#0891b2', // cyan
      flush: () => throttler.flush(),
    },
    {
      name: 'Rate Limiter',
      value: rateLimitedValue,
      state: rateLimiter.state,
      description: `Allows max ${rateLimiter.options.limit} executions per ${rateLimiter.options.window}ms window`,
      color: '#ea580c', // orange
    },
    {
      name: 'Queuer',
      value: queuedValue,
      state: queuer.state,
      description: `Processes items sequentially with ${queuer.options.wait}ms delay`,
      color: '#db2777', // pink
      flush: () => queuer.flush(),
    },
    {
      name: 'Batcher',
      value: batchedValue,
      state: batcher.state,
      description: `Processes in batches of ${batcher.options.maxSize} or after ${batcher.options.wait}ms`,
      color: '#8b5cf6', // purple
      flush: () => batcher.flush(),
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
              onChange={handleRangeChange}
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
        {utilityData.map((utility) => {
          const syncStatus = getSyncStatus(utility.value, utility.name)
          return (
            <div
              key={utility.name}
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
                  <strong>Executions:</strong> {utility.state.executionCount}
                </div>
                <div>
                  <strong>Reduction:</strong>{' '}
                  {instantExecutionCount === 0
                    ? '0'
                    : Math.round(
                        ((instantExecutionCount -
                          utility.state.executionCount) /
                          instantExecutionCount) *
                          100,
                      )}
                  %
                </div>
                {utility.name === 'Rate Limiter' && (
                  <div>
                    <strong>Rejections:</strong>{' '}
                    {(utility.state as any).rejectionCount}
                  </div>
                )}
                {utility.name === 'Queuer' && (
                  <>
                    <div>
                      <strong>Queue Size:</strong> {utility.state.size}
                    </div>
                  </>
                )}
                {utility.name === 'Batcher' && (
                  <>
                    <div>
                      <strong>Batch Size:</strong> {utility.state.size}
                    </div>
                    <div>
                      <strong>Items Processed:</strong>{' '}
                      {(utility.state as any).totalItemsProcessed}
                    </div>
                  </>
                )}
                <div>
                  <strong>Status:</strong> {utility.state.status}
                </div>
              </div>
              {'flush' in utility && typeof utility.flush === 'function' && (
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
        })}
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
          {utilityData.map((utility) => (
            <div key={utility.name}>
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
                {JSON.stringify(utility.state, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<ComparisonApp />)
