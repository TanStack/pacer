import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useQueuer } from '@tanstack/react-pacer/queuer'

function App() {
  // Use your state management library of choice
  const [queueItems, setQueueItems] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

  const queuer = useQueuer({
    maxSize: 25,
    initialItems: queueItems,
    wait: 1000, // wait 1 second between processing items - wait is optional!
    onUpdate: (queue) => {
      setQueueItems(queue.getAllItems())
    },
  })

  return (
    <div>
      <h1>TanStack Pacer useQueuer Example</h1>
      <div>Queue Size: {queuer.size()}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {queuer.isFull() ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queuer.peek()}</div>
      <div>Queue Empty: {queuer.isEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.isIdle() ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.isRunning() ? 'Running' : 'Stopped'}</div>
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
            queuer.addItem(nextNumber)
          }}
          disabled={queuer.isFull()}
        >
          Add Number
        </button>
        <button
          disabled={queuer.isEmpty()}
          onClick={() => {
            const item = queuer.getNextItem()
            console.log('getNextItem item', item)
          }}
        >
          Process Next
        </button>
        <button onClick={() => queuer.clear()} disabled={queuer.isEmpty()}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()} disabled={queuer.isEmpty()}>
          Reset Queue
        </button>
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
