import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useQueuer } from '@tanstack/react-pacer/queuer'
import { useStoragePersister } from '@tanstack/react-persister'
import type { QueuerState } from '@tanstack/react-pacer/queuer'

function App1() {
  // optional session storage persister to retain state on page refresh
  const queuerPersister = useStoragePersister<QueuerState<number>>({
    key: 'my-queuer',
    storage: sessionStorage,
    maxAge: 1000 * 60, // 1 minute
    buster: 'v1',
  })

  // The function that we will be queuing
  function processItem(item: number) {
    console.log('processing item', item)
  }

  const queuer = useQueuer(
    processItem,
    {
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      initialState: queuerPersister.loadState(),
      maxSize: 25, // optional, defaults to Infinity
      started: false, // optional, defaults to true
      wait: 1000, // wait 1 second between processing items - wait is optional!
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  useEffect(() => {
    queuerPersister.saveState(queuer.store.state)
  }, [queuer.store.state])

  return (
    <div>
      <h1>TanStack Pacer useQueuer Example 1 (with persister)</h1>
      <queuer.Subscribe
        selector={(state) => ({
          size: state.size,
          isFull: state.isFull,
          isEmpty: state.isEmpty,
          isIdle: state.isIdle,
          isRunning: state.isRunning,
          status: state.status,
          executionCount: state.executionCount,
          items: state.items,
        })}
      >
        {({
          size,
          isFull,
          isEmpty,
          isIdle,
          isRunning,
          status,
          executionCount,
          items,
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
            <div>Queue Items: {items.join(', ')}</div>
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
                  const nextNumber = items.length
                    ? items[items.length - 1] + 1
                    : 1
                  queuer.addItem(nextNumber)
                }}
                disabled={isFull}
              >
                Add Number
              </button>
              <button
                disabled={isEmpty}
                onClick={() => {
                  const item = queuer.execute()
                  console.log('getNextItem item', item)
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
              <button onClick={() => queuer.flush()} disabled={isEmpty}>
                Flush Queue
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

  function processItem(item: number) {
    setQueuedValue(item)
  }

  const queuer = useQueuer(
    processItem,
    {
      maxSize: 100,
      initialItems: [currentValue],
      wait: 100,
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    queuer.addItem(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useQueuer Example 2</h1>
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
              isRunning: state.isRunning,
              executionCount: state.executionCount,
            })}
          >
            {({ size, isFull, isEmpty, isIdle, isRunning, executionCount }) => (
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
                  <td>{isRunning ? 'Running' : 'Stopped'}</td>
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
      <div>
        <button onClick={() => queuer.flush()}>Flush Queue</button>
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
