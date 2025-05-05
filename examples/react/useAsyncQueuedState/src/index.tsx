import ReactDOM from 'react-dom/client'
import { useAsyncQueuedState } from '@tanstack/react-pacer/async-queuer'
import { useState } from 'react'

type AsyncTask = () => Promise<string>

const fakeWaitTime = 2000

function App() {
  const [concurrency, setConcurrency] = useState(2)

  const [, rerender] = useState(0) // demo - rerender when start/stop changes

  // Queuer that uses React.useState under the hood
  const [queueItems, queuer] = useAsyncQueuedState<string>({
    maxSize: 25,
    initialItems: Array.from({ length: 10 }, (_, i) => async () => {
      await new Promise((resolve) => setTimeout(resolve, fakeWaitTime))
      return `Initial Task ${i + 1}`
    }),
    concurrency: concurrency, // Process 2 items concurrently
    started: false,
    wait: 100, // for demo purposes - usually you would not want extra wait time unless you are throttling
    onIsRunningChange: (_asyncQueuer) => {
      rerender((prev) => prev + 1)
    },
    onReject: (item, _asyncQueuer) => {
      console.log('Queue is full, rejecting item', item)
    },
  })

  // Simulated async task
  const createAsyncTask =
    (num: number): AsyncTask =>
    async () => {
      // Simulate some async work
      await new Promise((resolve) => setTimeout(resolve, fakeWaitTime))
      return `Processed ${num}`
    }

  return (
    <div>
      <h1>TanStack Pacer useAsyncQueuedState Example</h1>
      <div></div>
      <div>Queue Size: {queuer.getSize()}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {queuer.getIsFull() ? 'Yes' : 'No'}</div>
      <div>Queue Empty: {queuer.getIsEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.getIsIdle() ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.getIsRunning() ? 'Running' : 'Stopped'}</div>
      <div>Items Processed: {queuer.getExecutionCount()}</div>
      <div>Active Tasks: {queuer.getActiveItems().length}</div>
      <div>Pending Tasks: {queuer.getPendingItems().length}</div>
      <div>
        Concurrency:{' '}
        <input
          type="number"
          min={1}
          value={concurrency}
          onChange={(e) =>
            setConcurrency(Math.max(1, parseInt(e.target.value) || 1))
          }
          style={{ width: '60px' }}
        />
      </div>
      <div style={{ minHeight: '250px' }}>
        Queue Items:
        {queueItems.map((task, index) => (
          <div
            // bad to use index as key, but these are arrow functions
            key={index}
          >
            {index}: {task.toString()}
          </div>
        ))}
      </div>
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
              ? Math.max(...queueItems.map((task) => parseInt(task.toString())))
              : 1
            queuer.addItem(createAsyncTask(nextNumber))
          }}
          disabled={queuer.getIsFull()}
        >
          Add Async Task
        </button>
        <button onClick={() => queuer.getNextItem()}>Get Next Item</button>
        <button onClick={() => queuer.clear()} disabled={queuer.getIsEmpty()}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()}>Reset Queue</button>
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
