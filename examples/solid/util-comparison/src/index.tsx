import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createDebouncer } from '@tanstack/solid-pacer/debouncer'
import { createThrottler } from '@tanstack/solid-pacer/throttler'
import { createRateLimiter } from '@tanstack/solid-pacer/rate-limiter'
import { createQueuer } from '@tanstack/solid-pacer/queuer'
import { createBatcher } from '@tanstack/solid-pacer/batcher'

function ComparisonApp() {
  const [currentValue, setCurrentValue] = createSignal(50)
  const [instantExecutionCount, setInstantExecutionCount] = createSignal(0)

  // State for each utility
  const [debouncedValue, setDebouncedValue] = createSignal(50)
  const [throttledValue, setThrottledValue] = createSignal(50)
  const [rateLimitedValue, setRateLimitedValue] = createSignal(50)
  const [queuedValue, setQueuedValue] = createSignal(50)
  const [batchedValue, setBatchedValue] = createSignal(50)

  // Initialize each utility
  const debouncer = createDebouncer(setDebouncedValue, {
    wait: 600,
  })

  const throttler = createThrottler(setThrottledValue, {
    wait: 600,
  })

  const rateLimiter = createRateLimiter(setRateLimitedValue, {
    limit: 20,
    window: 2000,
  })

  const queuer = createQueuer(setQueuedValue, {
    wait: 100,
    maxSize: 50,
  })

  const batcher = createBatcher(
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

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
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
    const isOutOfSync = processedValue !== currentValue()
    const isPending =
      (utilityName === 'Debouncer' && debouncer.state().status === 'pending') ||
      (utilityName === 'Throttler' && throttler.state().status === 'pending') ||
      (utilityName === 'Queuer' && queuer.state().status === 'running') ||
      (utilityName === 'Batcher' && batcher.state().status === 'pending')

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
      stroke-width="2"
      style={{ display: 'inline-block', 'vertical-align': 'middle' }}
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
      stroke-width="2"
      style={{ display: 'inline-block', 'vertical-align': 'middle' }}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  )

  const utilityData = () =>
    [
      {
        name: 'Debouncer',
        value: debouncedValue(),
        state: debouncer.state(),
        description: `Delays execution until after ${debouncer.options.wait}ms of inactivity`,
        color: '#3b82f6', // blue
        flush: () => debouncer.flush(),
      },
      {
        name: 'Throttler',
        value: throttledValue(),
        state: throttler.state(),
        description: `Limits execution to once every ${throttler.options.wait}ms`,
        color: '#0891b2', // cyan
        flush: () => throttler.flush(),
      },
      {
        name: 'Rate Limiter',
        value: rateLimitedValue(),
        state: rateLimiter.state(),
        description: `Allows max ${rateLimiter.options.limit} executions per ${rateLimiter.options.window}ms window`,
        color: '#ea580c', // orange
      },
      {
        name: 'Queuer',
        value: queuedValue(),
        state: queuer.state(),
        description: `Processes items sequentially with ${queuer.options.wait}ms delay`,
        color: '#db2777', // pink
        flush: () => queuer.flush(),
      },
      {
        name: 'Batcher',
        value: batchedValue(),
        state: batcher.state(),
        description: `Processes in batches of ${batcher.options.maxSize} or after ${batcher.options.wait}ms`,
        color: '#8b5cf6', // purple
        flush: () => batcher.flush(),
      },
    ] as const

  return (
    <div
      style={{
        padding: '12px',
        'font-family': 'system-ui, sans-serif',
        'max-width': '100%',
      }}
    >
      <h1 style={{ 'font-size': '1.5em', 'margin-bottom': '15px' }}>
        TanStack Pacer Utilities Comparison
      </h1>

      <div style={{ 'margin-bottom': '20px' }}>
        <h2 style={{ 'font-size': '1.2em', 'margin-bottom': '10px' }}>
          Instant Slider (Move this slider to see the utilities in action)
        </h2>
        <div style={{ 'margin-bottom': '15px' }}>
          <label>
            <strong>Current Value: {currentValue()}</strong>
            <input
              max="100"
              min="0"
              onInput={handleRangeChange}
              style={{ width: '100%', margin: '8px 0' }}
              type="range"
              value={currentValue()}
            />
          </label>
        </div>
        <div style={{ 'margin-bottom': '15px' }}>
          <strong>Total Interactions:</strong> {instantExecutionCount()}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          'margin-bottom': '30px',
        }}
      >
        <For each={utilityData()}>
          {(utility) => {
            const syncStatus = getSyncStatus(utility.value, utility.name)
            return (
              <div
                style={{
                  border: `2px solid ${utility.color}`,
                  'border-radius': '6px',
                  padding: '10px',
                  'background-color': syncStatus.isPending
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
                    'font-size': '1.1em',
                  }}
                >
                  {utility.name}
                </h3>
                <p
                  style={{
                    'font-size': '0.85em',
                    color: '#666',
                    margin: '0 0 12px 0',
                    'line-height': '1.4',
                  }}
                >
                  {utility.description}
                </p>

                <div style={{ 'margin-bottom': '12px' }}>
                  <div style={{ 'margin-bottom': '4px' }}>
                    <strong style={{ 'font-size': '0.9em' }}>
                      Value: {utility.value}
                    </strong>
                  </div>
                  <div style={{ 'margin-bottom': '6px' }}>
                    {syncStatus.isOutOfSync ? (
                      <span
                        style={{
                          display: 'flex',
                          'align-items': 'center',
                          gap: '3px',
                          color: syncStatus.isPending ? '#f59e0b' : '#ef4444',
                          'font-size': '0.8em',
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
                          'align-items': 'center',
                          gap: '3px',
                          color: '#10b981',
                          'font-size': '0.8em',
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
                      'accent-color': utility.color,
                    }}
                  />
                </div>

                <div
                  style={{
                    'font-size': '0.8em',
                    'margin-bottom': '12px',
                    'line-height': '1.3',
                  }}
                >
                  <div>
                    <strong>Executions:</strong> {utility.state.executionCount}
                  </div>
                  <div>
                    <strong>Reduction:</strong>{' '}
                    {instantExecutionCount() === 0
                      ? '0'
                      : Math.round(
                          ((instantExecutionCount() -
                            utility.state.executionCount) /
                            instantExecutionCount()) *
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
                      'background-color': utility.color,
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      'border-radius': '4px',
                      cursor: 'pointer',
                      'font-size': '0.85em',
                      width: '100%',
                    }}
                  >
                    Flush
                  </button>
                )}
              </div>
            )
          }}
        </For>
      </div>

      <div style={{ 'margin-top': '20px' }}>
        <h2 style={{ 'font-size': '1.2em', 'margin-bottom': '10px' }}>
          Detailed States
        </h2>
        <div
          style={{
            display: 'grid',
            'grid-template-columns': 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '8px',
          }}
        >
          <For each={utilityData()}>
            {(utility) => (
              <div>
                <h4
                  style={{
                    color: utility.color,
                    margin: '0 0 5px 0',
                    'font-size': '0.9em',
                  }}
                >
                  {utility.name} State
                </h4>
                <pre
                  style={{
                    'font-size': '0.7em',
                    'background-color': '#f5f5f5',
                    padding: '8px',
                    'border-radius': '4px',
                    overflow: 'auto',
                    'max-height': '150px',
                    margin: 0,
                  }}
                >
                  {JSON.stringify(utility.state, null, 2)}
                </pre>
              </div>
            )}
          </For>
        </div>
      </div>

      <div
        style={{
          'margin-top': '20px',
          padding: '15px',
          'background-color': '#f0f9ff',
          'border-radius': '6px',
        }}
      >
        <h2 style={{ 'font-size': '1.2em', 'margin-bottom': '10px' }}>
          How Each Utility Behaves
        </h2>
        <ul
          style={{
            'line-height': '1.5',
            'font-size': '0.9em',
            margin: 0,
            'padding-left': '20px',
          }}
        >
          <li>
            <strong>Debouncer:</strong> Waits for 600ms of inactivity before
            executing. Great for search inputs.
          </li>
          <li>
            <strong>Throttler:</strong> Executes immediately, then blocks for
            600ms. Perfect for scroll/resize events.
          </li>
          <li>
            <strong>Rate Limiter:</strong> Allows up to 20 executions per 2
            seconds, then blocks. Ideal for API calls.
          </li>
          <li>
            <strong>Queuer:</strong> Processes items one by one with a 100ms
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

render(() => <ComparisonApp />, document.getElementById('root')!)
