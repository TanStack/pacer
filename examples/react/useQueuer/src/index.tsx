import { scan } from 'react-scan' // dev-tools for demo
import ReactDOM from 'react-dom/client'
import { useQueuer } from '@tanstack/react-bouncer/queuer'
import { useState } from 'react'

function App() {
  // Use your state management library of choice
  const [queuedItems, setQueuedItems] = useState([1, 2, 3, 4, 5])

  const queuer = useQueuer({
    maxSize: 10,
    initialItems: queuedItems,
    onUpdate: (queuer) => {
      setQueuedItems(queuer.getItems())
    },
  })

  return (
    <div>
      <h1>TanStack Bouncer useQueuer Example</h1>
      <div>Queue Size: {queuer.size()}</div>
      <div>Queue Max Size: {10}</div>
      <div>Queue Full: {queuer.isFull() ? 'Yes' : 'No'}</div>
      <div>Queue Empty: {queuer.isEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queuer.peek()}</div>
      <div>Queued Items: {queuedItems.join(', ')}</div>
      <div>
        <button
          onClick={() => {
            const nextNumber = queuedItems.length
              ? queuedItems[queuedItems.length - 1] + 1
              : 1
            queuer.enqueue(nextNumber)
          }}
          disabled={queuer.isFull()}
        >
          Add Number
        </button>
        <button
          disabled={queuer.isEmpty()}
          onClick={() => {
            const item = queuer.dequeue()
            console.log('dequeued item', item)
          }}
        >
          Process Next
        </button>
        <button onClick={() => queuer.clear()} disabled={queuer.isEmpty()}>
          Clear Queue
        </button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan() // dev-tools for demo
