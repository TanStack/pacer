import ReactDOM from 'react-dom/client'
import { useQueuedState } from '@tanstack/react-pacer/queuer'
import { useState } from 'react'

function App1() {
  // Queuer that uses React.useState under the hood
  function processItem(item: number) {
    console.log('processing item', item)
  }

  // Note: useQueuedState requires items in selector, but we'll use Subscribe for reactive rendering
  const [queueItems, addItem, queuer] = useQueuedState(
    processItem,
    {
      maxSize: 25,
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      started: false,
      wait: 1000, // wait 1 second between processing items - wait is optional!
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  return (
    <div>
      <h1>TanStack Pacer useQueuedState Example 1</h1>
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
            <div>Queue Max Size: {25}</div>
            <div>Queue Full: {isFull ? 'Yes' : 'No'}</div>
            <div>Queue Peek: {queuer.peekNextItem()}</div>
            <div>Queue Empty: {isEmpty ? 'Yes' : 'No'}</div>
            <div>Queue Idle: {isIdle ? 'Yes' : 'No'}</div>
            <div>Queuer Status: {status}</div>
            <div>Items Processed: {executionCount}</div>
            <div>Queue Items: {queueItems.join(', ')}</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                maxWidth: '600px',
                margin: '16px 0',
              }}
            >
              <button
                onClick={() => {
                  const nextNumber = queueItems.length
                    ? queueItems[queueItems.length - 1] + 1
                    : 1
                  addItem(nextNumber)
                }}
                disabled={isFull}
              >
                Add Number
              </button>
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
      <queuer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </queuer.Subscribe>
    </div>
  )
}

function App2() {
  const [currentValue, setCurrentValue] = useState(50)
  const [queuedValue, setQueuedValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Queuer that processes a single value with delays
  const [, addItem, queuer] = useQueuedState(
    (item: number) => {
      setQueuedValue(item)
    },
    {
      maxSize: 100,
      started: true,
      wait: 100,
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    addItem(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useQueuedState Example 2</h1>
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
      <table>
        <tbody>
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
              </>
            )}
          </queuer.Subscribe>
        </tbody>
      </table>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Queued with 100ms wait time</p>
      </div>
      <queuer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </queuer.Subscribe>
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
