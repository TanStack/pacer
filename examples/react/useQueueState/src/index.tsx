import { scan } from 'react-scan' // dev-tools for demo
import ReactDOM from 'react-dom/client'
import { useQueueState } from '@tanstack/react-pacer/queue'

function App() {
  const [queueItems, queue] = useQueueState({
    maxSize: 10,
    initialItems: [1, 2, 3, 4, 5],
  })

  return (
    <div>
      <h1>TanStack Pacer useQueueState Example</h1>
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
            queue.addItem(nextNumber) // adds an item to the back of the queue, passing 'front' will add to the front
          }}
          disabled={queue.isFull()}
        >
          Add Number
        </button>
        <button
          disabled={queue.isEmpty()}
          onClick={() => {
            const item = queue.getNextItem() // gets the first item from the queue, passing 'back' will get the last item (stack-like behavior)
            console.log('getNextItem item', item)
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
