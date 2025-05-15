import ReactDOM from 'react-dom/client'
import { useQueuedState } from '@tanstack/react-pacer/queuer'
import { useState } from 'react'

function App1() {
  // Queuer that uses React.useState under the hood
  function processItem(item: number) {
    console.log('processing item', item)
  }

  const [queueItems, addItem, queuer] = useQueuedState(processItem, {
    maxSize: 25,
    initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    started: false,
    wait: 1000, // wait 1 second between processing items - wait is optional!
  })

  return (
    <div>
      <h1>TanStack Pacer useQueuedState Example 1</h1>
      <div>Queue Size: {queuer.getSize()}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {queuer.getIsFull() ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queuer.getPeek()}</div>
      <div>Queue Empty: {queuer.getIsEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.getIsIdle() ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.getIsRunning() ? 'Running' : 'Stopped'}</div>
      <div>Items Processed: {queuer.getExecutionCount()}</div>
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
          disabled={queuer.getIsFull()}
        >
          Add Number
        </button>
        <button
          disabled={queuer.getIsEmpty()}
          onClick={() => {
            queuer.execute()
          }}
        >
          Process Next
        </button>
        <button onClick={() => queuer.clear()} disabled={queuer.getIsEmpty()}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()} disabled={queuer.getIsEmpty()}>
          Reset Queue
        </button>
        <button onClick={() => queuer.start()} disabled={queuer.getIsRunning()}>
          Start Processing
        </button>
        <button onClick={() => queuer.stop()} disabled={!queuer.getIsRunning()}>
          Stop Processing
        </button>
      </div>
    </div>
  )
}

function App2() {
  const [currentValue, setCurrentValue] = useState(50)
  const [queuedValue, setQueuedValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Queuer that processes a single value with delays
  const [, addItem, queuer] = useQueuedState<number>(
    (item) => {
      setQueuedValue(item)
    },
    {
      maxSize: 100,
      started: true,
      wait: 100,
    },
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
          <tr>
            <td>Queue Size:</td>
            <td>{queuer.getSize()}</td>
          </tr>
          <tr>
            <td>Queue Full:</td>
            <td>{queuer.getIsFull() ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queue Empty:</td>
            <td>{queuer.getIsEmpty() ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queue Idle:</td>
            <td>{queuer.getIsIdle() ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queuer Status:</td>
            <td>{queuer.getIsRunning() ? 'Running' : 'Stopped'}</td>
          </tr>
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{queuer.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{instantExecutionCount - queuer.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              {instantExecutionCount === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount - queuer.getExecutionCount()) /
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
