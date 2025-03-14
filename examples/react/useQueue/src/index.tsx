import { scan } from 'react-scan' // dev-tools for demo
import ReactDOM from 'react-dom/client'
import { useQueue } from '@tanstack/react-bouncer/queue'
import { useState } from 'react'

function App() {
  // Use your state management library of choice
  const [queueItems, setQueueItems] = useState([1, 2, 3, 4, 5])

  const queue = useQueue({
    maxSize: 10,
    initialItems: queueItems,
    onUpdate: (queue) => {
      setQueueItems(queue.getItems())
    },
  })

  return (
    <div>
      <h1>TanStack Bouncer useQueue Example</h1>
      <div>Queue Size: {queue.size()}</div>
      <div>Queue Max Size: {10}</div>
      <div>Queue Full: {queue.isFull() ? 'Yes' : 'No'}</div>
      <div>Queue Empty: {queue.isEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queue.peek()}</div>
      <div>Queue Items: {queueItems.join(', ')}</div>
      <div>
        <button
          onClick={() => {
            const nextNumber = queueItems.length
              ? queueItems[queueItems.length - 1] + 1
              : 1
            queue.enqueue(nextNumber)
          }}
          disabled={queue.isFull()}
        >
          Add Number
        </button>
        <button
          disabled={queue.isEmpty()}
          onClick={() => {
            const item = queue.dequeue()
            console.log('dequeue item', item)
          }}
        >
          Process Next
        </button>
        <button onClick={() => queue.clear()} disabled={queue.isEmpty()}>
          Clear Queue
        </button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan() // dev-tools for demo
