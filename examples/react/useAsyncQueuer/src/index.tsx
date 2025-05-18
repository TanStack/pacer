import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncQueuer } from '@tanstack/react-pacer/async-queuer'

const fakeWaitTime = 500

type Item = number

function App() {
  // Use your state management library of choice
  const [queueItems, setQueueItems] = useState<Array<Item>>([])
  const [concurrency, setConcurrency] = useState(2)

  const [, rerender] = useState(0) // demo - rerender when start/stop changes

  // The function to process each item (now a number)
  async function processItem(item: Item): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, fakeWaitTime))
    console.log(`Processed ${item}`)
  }

  const asyncQueuer = useAsyncQueuer(processItem, {
    maxSize: 25,
    initialItems: Array.from({ length: 10 }, (_, i) => i + 1),
    concurrency, // Process 2 items concurrently
    started: false,
    wait: 100, // for demo purposes - usually you would not want extra wait time if you are also throttling with concurrency
    onItemsChange: (asyncQueuer: any) => {
      setQueueItems(asyncQueuer.getAllItems())
    },
    onIsRunningChange: (_asyncQueuer: any) => {
      rerender((prev) => prev + 1)
    },
    onReject: (item: Item, asyncQueuer: any) => {
      console.log(
        'Queue is full, rejecting item',
        item,
        asyncQueuer.getRejectionCount(),
      )
    },
    onError: (error: unknown, _asyncQueuer: any) => {
      console.error('Error processing item', error, asyncQueuer.getErrorCount()) // optionally, handle errors here instead of your own try/catch
    },
  })

  return (
    <div>
      <h1>TanStack Pacer useAsyncQueuer Example</h1>
      <div></div>
      <div>Queue Size: {asyncQueuer.getSize()}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {asyncQueuer.getIsFull() ? 'Yes' : 'No'}</div>
      <div>Queue Empty: {asyncQueuer.getIsEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {asyncQueuer.getIsIdle() ? 'Yes' : 'No'}</div>
      <div>
        Queuer Status: {asyncQueuer.getIsRunning() ? 'Running' : 'Stopped'}
      </div>
      <div>Items Processed: {asyncQueuer.getSuccessCount()}</div>
      <div>Items Rejected: {asyncQueuer.getRejectionCount()}</div>
      <div>Active Tasks: {asyncQueuer.getActiveItems().length}</div>
      <div>Pending Tasks: {asyncQueuer.getPendingItems().length}</div>
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
        {queueItems.map((item, index) => (
          <div key={index}>
            {index}: {item}
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
              ? Math.max(...queueItems) + 1
              : 1
            asyncQueuer.addItem(nextNumber)
          }}
          disabled={asyncQueuer.getIsFull()}
        >
          Add Async Task
        </button>
        <button onClick={() => asyncQueuer.getNextItem()}>Get Next Item</button>
        <button
          onClick={() => asyncQueuer.clear()}
          disabled={asyncQueuer.getIsEmpty()}
        >
          Clear Queue
        </button>
        <button onClick={() => asyncQueuer.reset()}>Reset Queue</button>
        <button
          onClick={() => asyncQueuer.start()}
          disabled={asyncQueuer.getIsRunning()}
        >
          Start Processing
        </button>
        <button
          onClick={() => asyncQueuer.stop()}
          disabled={!asyncQueuer.getIsRunning()}
        >
          Stop Processing
        </button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
