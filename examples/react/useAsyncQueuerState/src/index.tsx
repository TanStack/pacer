import { scan } from 'react-scan' // dev-tools for demo
import ReactDOM from 'react-dom/client'
import { useAsyncQueuerState } from '@tanstack/react-pacer/async-queuer'

type AsyncTask = () => Promise<string>

const fakeWaitTime = 2000

function App() {
  // Queuer that uses React.useState under the hood
  const [queueItems, queuer] = useAsyncQueuerState<string>({
    maxSize: 25,
    initialItems: Array.from({ length: 10 }, (_, i) => async () => {
      await new Promise((resolve) => setTimeout(resolve, fakeWaitTime))
      return `Initial Task ${i + 1}`
    }),
    concurrency: 2, // Process 2 items concurrently
    wait: 100, // for demo purposes - usually you would not want extra wait time unless you are throttling
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
      <h1>TanStack Pacer useAsyncQueuer Example</h1>
      <div></div>
      <div>Queue Size: {queuer.size()}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {queuer.isFull() ? 'Yes' : 'No'}</div>
      <div>Queue Empty: {queuer.isEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.isIdle() ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.isRunning() ? 'Running' : 'Stopped'}</div>
      <div>Items Processed: {queuer.getExecutionCount()}</div>
      <div>Active Tasks: {queuer.getActive().length}</div>
      <div>Pending Tasks: {queuer.getPending().length}</div>
      <div>
        Concurrency:{' '}
        <input
          type="number"
          min={1}
          defaultValue={2}
          onChange={(e) =>
            queuer.throttle(Math.max(1, parseInt(e.target.value) || 1))
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
            {task.toString()}
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
          disabled={queuer.isFull()}
        >
          Add Async Task
        </button>
        <button onClick={() => queuer.getNextItem()}>Get Next Item</button>
        <button onClick={() => queuer.clear()} disabled={queuer.isEmpty()}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()}>Reset Queue</button>
        <button onClick={() => queuer.start()} disabled={queuer.isRunning()}>
          Start Processing
        </button>
        <button onClick={() => queuer.stop()} disabled={!queuer.isRunning()}>
          Stop Processing
        </button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan() // dev-tools for demo
