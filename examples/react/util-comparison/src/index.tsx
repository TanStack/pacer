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
  const debouncer = useDebouncer(setDebouncedValue, {
    wait: 600,
  })

  const throttler = useThrottler(setThrottledValue, {
    wait: 600,
  })

  const rateLimiter = useRateLimiter(setRateLimitedValue, {
    limit: 10,
    window: 2000,
  })

  const queuer = useQueuer(setQueuedValue, {
    wait: 200,
    maxSize: 50,
  })

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
      description: 'Delays execution until after 600ms of inactivity',
      color: '#3b82f6', // blue
      flush: () => debouncer.flush(),
    },
    {
      name: 'Throttler',
      value: throttledValue,
      state: throttler.state,
      description: 'Limits execution to once every 600ms',
      color: '#0891b2', // cyan
      flush: () => throttler.flush(),
    },
    {
      name: 'Rate Limiter',
      value: rateLimitedValue,
      state: rateLimiter.state,
      description: 'Allows max 10 executions per 2000ms window',
      color: '#ea580c', // orange
    },
    {
      name: 'Queuer',
      value: queuedValue,
      state: queuer.state,
      description: 'Processes items sequentially with 200ms delay',
      color: '#db2777', // pink
      flush: () => queuer.flush(),
    },
    {
      name: 'Batcher',
      value: batchedValue,
      state: batcher.state,
      description: 'Processes in batches of 5 or after 600ms',
      color: '#8b5cf6', // purple
      flush: () => batcher.flush(),
    },
  ] as const

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>TanStack Pacer Utilities Comparison</h1>

      <div style={{ marginBottom: '30px' }}>
        <h2>Master Control</h2>
        <div style={{ marginBottom: '20px' }}>
          <label>
            <strong>Current Value: {currentValue}</strong>
            <input
              max="100"
              min="0"
              onChange={handleRangeChange}
              style={{ width: '100%', margin: '10px 0' }}
              type="range"
              value={currentValue}
            />
          </label>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <strong>Total Interactions:</strong> {instantExecutionCount}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
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
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: syncStatus.isPending
                  ? 'rgba(254, 249, 195, 0.4)' // yellowish if pending
                  : syncStatus.isOutOfSync
                    ? 'rgba(254, 226, 226, 0.4)' // reddish if out of sync
                    : 'rgba(209, 250, 229, 0.4)', // greenish if synced
                transition: 'background-color 0.2s ease',
              }}
            >
              <h3 style={{ color: utility.color, margin: '0 0 10px 0' }}>
                {utility.name}
              </h3>
              <p
                style={{
                  fontSize: '0.9em',
                  color: '#666',
                  margin: '0 0 15px 0',
                }}
              >
                {utility.description}
              </p>

              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '5px',
                  }}
                >
                  <strong>Processed Value: {utility.value}</strong>
                  {syncStatus.isOutOfSync ? (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: syncStatus.isPending ? '#f59e0b' : '#ef4444',
                        fontSize: '0.85em',
                        cursor: syncStatus.tooltip ? 'help' : 'default',
                      }}
                      title={syncStatus.tooltip}
                    >
                      <WarningIcon size={14} />
                      {syncStatus.statusText}
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#10b981',
                        fontSize: '0.85em',
                      }}
                    >
                      <SuccessIcon size={14} />
                      {syncStatus.statusText}
                    </span>
                  )}
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={utility.value}
                  readOnly
                  style={{
                    width: '100%',
                    margin: '5px 0',
                    accentColor: utility.color,
                  }}
                />
              </div>

              <div style={{ fontSize: '0.9em', marginBottom: '15px' }}>
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
                    <div>
                      <strong>Status:</strong> {utility.state.status}
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
              </div>
              {'flush' in utility && typeof utility.flush === 'function' && (
                <button
                  onClick={utility.flush}
                  style={{
                    backgroundColor: utility.color,
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                  }}
                >
                  Flush
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Detailed States</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
          }}
        >
          {utilityData.map((utility) => (
            <div key={utility.name}>
              <h4 style={{ color: utility.color }}>{utility.name} State</h4>
              <pre
                style={{
                  fontSize: '0.8em',
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {JSON.stringify(utility.state, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
        }}
      >
        <h2>How Each Utility Behaves</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li>
            <strong>Debouncer:</strong> Waits for 600ms of inactivity before
            executing. Great for search inputs.
          </li>
          <li>
            <strong>Throttler:</strong> Executes immediately, then blocks for
            600ms. Perfect for scroll/resize events.
          </li>
          <li>
            <strong>Rate Limiter:</strong> Allows up to 10 executions per 2
            seconds, then blocks. Ideal for API calls.
          </li>
          <li>
            <strong>Queuer:</strong> Processes items one by one with a 200ms
            delay. Useful for sequential operations.
          </li>
          <li>
            <strong>Batcher:</strong> Collects items and processes them in
            groups of 5 or after 600ms. Efficient for bulk operations.
          </li>
        </ul>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<ComparisonApp />)
