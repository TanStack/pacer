import ReactDOM from 'react-dom/client'
import { useQueuedValue } from '@tanstack/react-pacer/queuer'
import { useState } from 'react'

function App1() {
  const [instantSearchValue, setInstantSearchValue] = useState('')

  // Queuer that processes a single value with delays
  const [value, queuer] = useQueuedValue(
    instantSearchValue,
    {
      maxSize: 25,
      wait: 500, // wait 500ms between processing value changes
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  return (
    <div>
      <h1>TanStack Pacer useQueuedValue Example 1</h1>
      <div>Current Value: {value}</div>
      <hr />
      <queuer.Subscribe
        selector={(state) => ({
          size: state.size,
          isFull: state.isFull,
          isEmpty: state.isEmpty,
          isIdle: state.isIdle,
          status: state.status,
          executionCount: state.executionCount,
          isRunning: state.isRunning,
        })}
      >
        {({
          size,
          isFull,
          isEmpty,
          isIdle,
          status,
          executionCount,
          isRunning,
        }) => (
          <>
            <div>Queue Size: {size}</div>
            <div>Queue Full: {isFull ? 'Yes' : 'No'}</div>
            <div>Queue Peek: {queuer.peekNextItem()}</div>
            <div>Queue Empty: {isEmpty ? 'Yes' : 'No'}</div>
            <div>Queue Idle: {isIdle ? 'Yes' : 'No'}</div>
            <div>Queuer Status: {status}</div>
            <div>Items Processed: {executionCount}</div>
            <div>Queue Items: {queuer.peekAllItems().join(', ')}</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                maxWidth: '600px',
                margin: '16px 0',
              }}
            >
              <input
                autoFocus
                type="search"
                value={instantSearchValue}
                onChange={(e) => {
                  setInstantSearchValue(e.target.value) // instantly update the local search value
                }}
                placeholder="Enter search term..."
                disabled={isFull}
              />
              <button
                disabled={isEmpty}
                onClick={() => {
                  queuer.execute()
                }}
              >
                Process Next
              </button>
              <button onClick={() => queuer.clear()} disabled={isEmpty}>
                Clear Queue
              </button>
              <button onClick={() => queuer.reset()} disabled={isEmpty}>
                Reset Queue
              </button>
              <button onClick={() => queuer.start()} disabled={isRunning}>
                Start Processing
              </button>
              <button onClick={() => queuer.stop()} disabled={!isRunning}>
                Stop Processing
              </button>
            </div>
          </>
        )}
      </queuer.Subscribe>
      <pre style={{ marginTop: '20px' }}>
        <queuer.Subscribe selector={(state) => state}>
          {(state) => JSON.stringify(state, null, 2)}
        </queuer.Subscribe>
      </pre>
    </div>
  )
}

function App2() {
  const [currentValue, setCurrentValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Queuer that processes a single value with delays
  const [queuedValue, queuer] = useQueuedValue(
    currentValue,
    {
      maxSize: 100,
      wait: 100,
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer useQueuedValue Example 2</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue}
            onChange={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{currentValue}</span>
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Queued Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={queuedValue}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{queuedValue}</span>
        </label>
      </div>
      <queuer.Subscribe
        selector={(state) => ({
          size: state.size,
          isFull: state.isFull,
          isEmpty: state.isEmpty,
          isIdle: state.isIdle,
          status: state.status,
          executionCount: state.executionCount,
        })}
      >
        {({ size, isFull, isEmpty, isIdle, status, executionCount }) => (
          <>
            <table>
              <tbody>
                <tr>
                  <td>Queue Size:</td>
                  <td>{size}</td>
                </tr>
                <tr>
                  <td>Queue Full:</td>
                  <td>{isFull ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Queue Empty:</td>
                  <td>{isEmpty ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Queue Idle:</td>
                  <td>{isIdle ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Queuer Status:</td>
                  <td>{status}</td>
                </tr>
                <tr>
                  <td>Instant Executions:</td>
                  <td>{instantExecutionCount}</td>
                </tr>
                <tr>
                  <td>Items Processed:</td>
                  <td>{executionCount}</td>
                </tr>
                <tr>
                  <td>Saved Executions:</td>
                  <td>{instantExecutionCount - executionCount}</td>
                </tr>
                <tr>
                  <td>% Reduction:</td>
                  <td>
                    {instantExecutionCount === 0
                      ? '0'
                      : Math.round(
                          ((instantExecutionCount - executionCount) /
                            instantExecutionCount) *
                            100,
                        )}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ color: '#666', fontSize: '0.9em' }}>
              <p>Queued with 100ms wait time</p>
            </div>
          </>
        )}
      </queuer.Subscribe>
      <pre style={{ marginTop: '20px' }}>
        <queuer.Subscribe selector={(state) => state}>
          {(state) => JSON.stringify(state, null, 2)}
        </queuer.Subscribe>
      </pre>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
  </div>,
)
