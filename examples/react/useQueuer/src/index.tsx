import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useQueuer } from '@tanstack/react-pacer/queuer'

function App() {
  // Use your state management library of choice
  const [queueItems, setQueueItems] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

  const queuer = useQueuer({
    maxSize: 25,
    initialItems: queueItems,
    started: false,
    wait: 1000, // wait 1 second between processing items - wait is optional!
    onItemsChange: (queue) => {
      setQueueItems(queue.getAllItems())
    },
  })

  return (
    <div>
      <h1>TanStack Pacer useQueuer Example</h1>
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
            queuer.addItem(nextNumber)
          }}
          disabled={queuer.getIsFull()}
        >
          Add Number
        </button>
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
