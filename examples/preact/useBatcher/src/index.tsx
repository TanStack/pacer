import { useState } from 'preact/hooks'
import { render } from 'preact'
import { useBatcher } from '@tanstack/preact-pacer/batcher'
import { PacerProvider } from '@tanstack/preact-pacer/provider'

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

  // No selector needed - we'll use Subscribe HOC to subscribe to state in the component tree
  const batcher = useBatcher(processBatch, {
    // started: false, // true by default
    maxSize: 5, // Process in batches of 5 (if comes before wait time)
    wait: 3000, // wait up to 3 seconds before processing a batch (if time elapses before maxSize is reached)
    getShouldExecute: (items, _batcher) => items.includes(42), // or pass in a custom function to determine if the batch should be processed
  })
  // Alternative to batcher.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
  // (state) => state,

  return (
    <div>
      <h1>TanStack Pacer useBatcher Example 1</h1>
      <batcher.Subscribe
        selector={(state) => ({
          size: state.size,
          executionCount: state.executionCount,
          totalItemsProcessed: state.totalItemsProcessed,
        })}
      >
        {({ size, executionCount, totalItemsProcessed }) => (
          <>
            <div>Batch Size: {size}</div>
            <div>Batch Max Size: {3}</div>
            <div>Batch Items: {batcher.peekAllItems().join(', ')}</div>
            <div>Batches Processed: {executionCount}</div>
            <div>Items Processed: {totalItemsProcessed}</div>
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
                    ? batcher.peekAllItems()[
                        batcher.peekAllItems().length - 1
                      ] + 1
                    : 1
                  batcher.addItem(nextNumber)
                }}
              >
                Add Number
              </button>
              <button
                disabled={size === 0}
                onClick={() => {
                  batcher.flush()
                }}
              >
                Flush Current Batch
              </button>
            </div>
          </>
        )}
      </batcher.Subscribe>
      <batcher.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </batcher.Subscribe>
    </div>
  )
}

const root = document.getElementById('root')!
render(
  // optionally, provide default options to an optional PacerProvider
  <PacerProvider
  // defaultOptions={{
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
  root,
)
