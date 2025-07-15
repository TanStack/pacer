import { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { batch } from '@tanstack/react-pacer/batcher'

function App() {
  const [processedBatches, setProcessedBatches] = useState<
    Array<Array<number>>
  >([])
  const [batchItems, setBatchItems] = useState<Array<number>>([])

  // Create the batcher function only once using useCallback
  const addToBatch = useCallback(
    batch<number>(
      (items) => {
        setProcessedBatches((prev) => [...prev, items])
        console.log('Processing batch', items)
      },
      {
        maxSize: 5,
        wait: 3000,
        getShouldExecute: (items) => items.includes(42),
        onItemsChange: (batcherInstance) => {
          setBatchItems(batcherInstance.peekAllItems())
        },
      },
    ),
    [], // must be memoized to avoid re-creating the batcher on every render (consider using useBatcher instead in react)
  )

  return (
    <div>
      <h1>TanStack Pacer batcher Example</h1>
      <div>Batch Items: {batchItems.join(', ')}</div>
      <div>
        Processed Batches:{' '}
        {processedBatches.map((b, i) => (
          <span key={i}>[{b.join(', ')}], </span>
        ))}
      </div>
      <button
        onClick={() => {
          const nextNumber = batchItems.length
            ? batchItems[batchItems.length - 1] + 1
            : 1
          addToBatch(nextNumber)
        }}
      >
        Add Number
      </button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
