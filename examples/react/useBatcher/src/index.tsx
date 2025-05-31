import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useBatcher } from '@tanstack/react-pacer/batcher'

function App1() {
  // Use your state management library of choice
  const [batchItems, setBatchItems] = useState<Array<number>>([])
  const [processedBatches, setProcessedBatches] = useState<
    Array<Array<number>>
  >([])

  // The function that will process a batch of items
  function processBatch(items: Array<number>) {
    setProcessedBatches((prev) => [...prev, items])
    console.log('processing batch', items)
  }

  const batcher = useBatcher(processBatch, {
    // started: false, // true by default
    maxSize: 5, // Process in batches of 5 (if comes before wait time)
    wait: 3000, // wait up to 3 seconds before processing a batch (if time elapses before maxSize is reached)
    getShouldExecute: (items, _batcher) => items.includes(42), // or pass in a custom function to determine if the batch should be processed
    onItemsChange: (batcher) => {
      setBatchItems(batcher.peekAllItems())
    },
  })

  return (
    <div>
      <h1>TanStack Pacer useBatcher Example 1</h1>
      <div>Batch Size: {batcher.getSize()}</div>
      <div>Batch Max Size: {3}</div>
      <div>Batch Items: {batchItems.join(', ')}</div>
      <div>Batches Processed: {batcher.getBatchExecutionCount()}</div>
      <div>Items Processed: {batcher.getItemExecutionCount()}</div>
      <div>
        Processed Batches:{' '}
        {processedBatches.map((b, i) => (
          <>
            <span key={i}>[{b.join(', ')}]</span>,{' '}
          </>
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
            const nextNumber = batchItems.length
              ? batchItems[batchItems.length - 1] + 1
              : 1
            batcher.addItem(nextNumber)
          }}
        >
          Add Number
        </button>
        <button
          disabled={batcher.getSize() === 0}
          onClick={() => {
            batcher.execute()
          }}
        >
          Process Current Batch
        </button>
        <button
          onClick={() => batcher.stop()}
          disabled={!batcher.getIsRunning()}
        >
          Stop Batching
        </button>
        <button
          onClick={() => batcher.start()}
          disabled={batcher.getIsRunning()}
        >
          Start Batching
        </button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
  </div>,
)
