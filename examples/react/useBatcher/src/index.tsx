import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useBatcher } from '@tanstack/react-pacer/batcher'
import { PacerProvider } from '@tanstack/react-pacer/provider'

function App1() {
  // Use your state management library of choice
  const [processedBatches, setProcessedBatches] = useState<
    Array<Array<number>>
  >([])

  // The function that will process a batch of items
  function processBatch(items: Array<number>) {
    setProcessedBatches((prev) => [...prev, items])
    console.log('processing batch', items)
  }

  const batcher = useBatcher(
    processBatch,
    {
      // started: false, // true by default
      maxSize: 5, // Process in batches of 5 (if comes before wait time)
      wait: 3000, // wait up to 3 seconds before processing a batch (if time elapses before maxSize is reached)
      getShouldExecute: (items, _batcher) => items.includes(42), // or pass in a custom function to determine if the batch should be processed
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      size: state.size,
      executionCount: state.executionCount,
      totalItemsProcessed: state.totalItemsProcessed,
    }),
  )

  return (
    <div>
      <h1>TanStack Pacer useBatcher Example 1</h1>
      <div>Batch Size: {batcher.state.size}</div>
      <div>Batch Max Size: {3}</div>
      <div>Batch Items: {batcher.peekAllItems().join(', ')}</div>
      <div>Batches Processed: {batcher.state.executionCount}</div>
      <div>Items Processed: {batcher.state.totalItemsProcessed}</div>
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
            const nextNumber = batcher.peekAllItems().length
              ? batcher.peekAllItems()[batcher.peekAllItems().length - 1] + 1
              : 1
            batcher.addItem(nextNumber)
          }}
        >
          Add Number
        </button>
        <button
          disabled={batcher.state.size === 0}
          onClick={() => {
            batcher.flush()
          }}
        >
          Flush Current Batch
        </button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(batcher.store.state, null, 2)}
      </pre>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  // optionally, provide default options to an optional PacerProvider
  <PacerProvider
  // options={{
  //   batcher: {
  //     maxSize: 10,
  //   },
  // }}
  >
    <div>
      <App1 />
      <hr />
    </div>
  </PacerProvider>,
)
