import ReactDOM from 'react-dom/client'
import { useQueuedValue } from '@tanstack/react-pacer/queuer'
import { useState } from 'react'

function App() {
  const [instantSearchValue, setInstantSearchValue] = useState('')

  // Queuer that processes a single value with delays
  const [value, queuer] = useQueuedValue(instantSearchValue, {
    maxSize: 25,
    started: false,
    wait: 500, // wait 500ms between processing value changes
  })

  return (
    <div>
      <h1>TanStack Pacer useQueuedValue Example</h1>
      <div>Current Value: {value}</div>
      <hr />
      <div>Queue Size: {queuer.getSize()}</div>
      <div>Queue Full: {queuer.getIsFull() ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queuer.getPeek()}</div>
      <div>Queue Empty: {queuer.getIsEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.getIsIdle() ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.getIsRunning() ? 'Running' : 'Stopped'}</div>
      <div>Items Processed: {queuer.getExecutionCount()}</div>
      <div>Queue Items: {queuer.getAllItems().join(', ')}</div>
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
          disabled={queuer.getIsFull()}
        />
        <button
          disabled={queuer.getIsEmpty()}
          onClick={() => {
            const item = queuer.getNextItem()
            console.log('getNextItem item', item)
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

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
