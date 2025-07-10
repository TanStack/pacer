import ReactDOM from 'react-dom/client'
import { useQueuedValue } from '@tanstack/react-pacer/queuer'
import { useState } from 'react'

function App1() {
  const [instantSearchValue, setInstantSearchValue] = useState('')

  // Queuer that processes a single value with delays
  const [value, queuer] = useQueuedValue(instantSearchValue, {
    maxSize: 25,
    wait: 500, // wait 500ms between processing value changes
  })

  return (
    <div>
      <h1>TanStack Pacer useQueuedValue Example 1</h1>
      <div>Current Value: {value}</div>
      <hr />
      <div>Queue Size: {queuer.state.size}</div>
      <div>Queue Full: {queuer.state.isFull ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queuer.peekNextItem()}</div>
      <div>Queue Empty: {queuer.state.isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.state.isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.state.status}</div>
      <div>Items Processed: {queuer.state.executionCount}</div>
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
          disabled={queuer.state.isFull}
        />
        <button
          disabled={queuer.state.isEmpty}
          onClick={() => {
            queuer.execute()
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
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(queuer.state, null, 2)}
      </pre>
    </div>
  )
}

function App2() {
  const [currentValue, setCurrentValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Queuer that processes a single value with delays
  const [queuedValue, queuer] = useQueuedValue(currentValue, {
    maxSize: 100,
    wait: 100,
  })

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
            <td>{queuer.state.status}</td>
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
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(queuer.state, null, 2)}
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
