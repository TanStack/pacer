import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useQueuer } from '@tanstack/react-pacer/queuer'
import { PacerProvider } from '@tanstack/react-pacer/provider'

function App1() {
  // The function that we will be queuing
  function processItem(item: number) {
    console.log('processing item', item)
  }

  const queuer = useQueuer(
    processItem,
    {
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      maxSize: 25, // optional, defaults to Infinity
      started: false, // optional, defaults to true
      wait: 1000, // wait 1 second between processing items - wait is optional!
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      size: state.size,
      isFull: state.isFull,
      isEmpty: state.isEmpty,
      isIdle: state.isIdle,
      isRunning: state.isRunning,
      status: state.status,
      executionCount: state.executionCount,
      items: state.items,
    }),
  )

  return (
    <div>
      <h1>TanStack Pacer useQueuer Example 1</h1>
      <div>Queue Size: {queuer.state.size}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {queuer.state.isFull ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queuer.peekNextItem()}</div>
      <div>Queue Empty: {queuer.state.isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.state.isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.state.status}</div>
      <div>Items Processed: {queuer.state.executionCount}</div>
      <div>Queue Items: {queuer.state.items.join(', ')}</div>
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
            const nextNumber = queuer.state.items.length
              ? queuer.state.items[queuer.state.items.length - 1] + 1
              : 1
            queuer.addItem(nextNumber)
          }}
          disabled={queuer.state.isFull}
        >
          Add Number
        </button>
        <button
          disabled={queuer.state.isEmpty}
          onClick={() => {
            const item = queuer.execute()
            console.log('getNextItem item', item)
          }}
        >
          Process Next
        </button>
        <button onClick={() => queuer.clear()} disabled={queuer.state.isEmpty}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()} disabled={queuer.state.isEmpty}>
          Reset Queue
        </button>
        <button
          onClick={() => queuer.start()}
          disabled={queuer.state.isRunning}
        >
          Start Processing
        </button>
        <button
          onClick={() => queuer.stop()}
          disabled={!queuer.state.isRunning}
        >
          Stop Processing
        </button>
        <button onClick={() => queuer.flush()} disabled={queuer.state.isEmpty}>
          Flush Queue
        </button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(queuer.store.state, null, 2)}
      </pre>
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
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      size: state.size,
      isFull: state.isFull,
      isEmpty: state.isEmpty,
      isIdle: state.isIdle,
      isRunning: state.isRunning,
      executionCount: state.executionCount,
    }),
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
          <tr>
            <td>Queue Size:</td>
            <td>{queuer.state.size}</td>
          </tr>
          <tr>
            <td>Queue Full:</td>
            <td>{queuer.state.isFull ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queue Empty:</td>
            <td>{queuer.state.isEmpty ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queue Idle:</td>
            <td>{queuer.state.isIdle ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queuer Status:</td>
            <td>{queuer.state.isRunning ? 'Running' : 'Stopped'}</td>
          </tr>
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{queuer.state.executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{instantExecutionCount - queuer.state.executionCount}</td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              {instantExecutionCount === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount - queuer.state.executionCount) /
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
      <div>
        <button onClick={() => queuer.flush()}>Flush Queue</button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(queuer.store.state, null, 2)}
      </pre>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  // optionally, provide default options to an optional PacerProvider
  <PacerProvider
  // defaultOptions={{
  //   queuer: {
  //     maxSize: 50,
  //   },
  // }}
  >
    <div>
      <App1 />
      <hr />
      <App2 />
    </div>
  </PacerProvider>,
)
