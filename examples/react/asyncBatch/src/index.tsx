import { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { asyncBatch } from '@tanstack/react-pacer/async-batcher'

const fakeProcessingTime = 1000

type Item = {
  id: number
  value: string
  timestamp: number
}

function App() {
  const [processedBatches, setProcessedBatches] = useState<
    Array<{ items: Array<Item>; result: string; timestamp: number }>
  >([])
  const [errors, setErrors] = useState<Array<string>>([])
  const [pendingItems, setPendingItems] = useState<Array<Item>>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [shouldFail, setShouldFail] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)

  // The async function that will process a batch of items
  const processBatch = useCallback(
    async (items: Array<Item>): Promise<string> => {
      console.log('Processing batch of', items.length, 'items:', items)
      setIsProcessing(true)

      try {
        // Simulate async processing time
        await new Promise((resolve) => setTimeout(resolve, fakeProcessingTime))

        // Simulate occasional failures for demo purposes
        if (shouldFail && Math.random() < 0.3) {
          throw new Error(
            `Processing failed for batch with ${items.length} items`,
          )
        }

        // Return a result from the batch processing
        const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`

        setProcessedBatches((prev) => [
          ...prev,
          { items, result, timestamp: Date.now() },
        ])

        setSuccessCount((prev) => prev + 1)
        console.log('Batch succeeded:', result)

        return result
      } catch (error: any) {
        setErrors((prev) => [
          ...prev,
          `Error: ${error.message} (${new Date().toLocaleTimeString()})`,
        ])
        setErrorCount((prev) => prev + 1)
        console.error('Batch failed:', error)
        throw error
      } finally {
        setIsProcessing(false)
      }
    },
    [shouldFail],
  )

  // Create the async batcher function using useCallback
  const addToBatch = useCallback(
    asyncBatch<Item>(processBatch, {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) =>
        items.some((item) => item.value.includes('urgent')),
      throwOnError: false, // Don't throw errors, handle them in the processBatch function
      onItemsChange: (batcher) => {
        setPendingItems(batcher.peekAllItems())
      },
      onSuccess: (result, batcher) => {
        console.log('AsyncBatcher succeeded:', result)
        console.log(
          'Total successful batches:',
          batcher.store.state.successCount,
        )
      },
      onError: (error: any, failedItems, batcher) => {
        console.error('AsyncBatcher failed:', error)
        console.log('Failed items:', failedItems)
        console.log('Total failed batches:', batcher.store.state.errorCount)
      },
      onSettled: (batcher) => {
        console.log(
          'Batch settled. Total processed items:',
          batcher.store.state.totalItemsProcessed,
        )
      },
    }),
    [], // must be memoized to avoid re-creating the batcher on every render (consider using useAsyncBatcher instead in react)
  )

  const addItem = (isUrgent = false) => {
    const nextId = Date.now()
    const item: Item = {
      id: nextId,
      value: isUrgent ? `urgent-${nextId}` : `item-${nextId}`,
      timestamp: nextId,
    }
    addToBatch(item)
  }

  return (
    <div>
      <h1>TanStack Pacer asyncBatch Example</h1>

      <div>
        <h3>Batch Status</h3>
        <div>Pending Items: {pendingItems.length}</div>
        <div>Max Batch Size: 5</div>
        <div>Is Processing: {isProcessing ? 'Yes' : 'No'}</div>
        <div>Successful Batches: {successCount}</div>
        <div>Failed Batches: {errorCount}</div>
      </div>

      <div>
        <h3>Current Pending Items</h3>
        <div style={{ minHeight: '100px' }}>
          {pendingItems.length === 0 ? (
            <em>No items pending</em>
          ) : (
            pendingItems.map((item, index) => (
              <div key={item.id}>
                {index + 1}: {item.value} (added at{' '}
                {new Date(item.timestamp).toLocaleTimeString()})
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3>Controls</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            maxWidth: '600px',
          }}
        >
          <button onClick={() => addItem(false)}>Add Regular Item</button>
          <button onClick={() => addItem(true)}>
            Add Urgent Item (Processes Immediately)
          </button>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={shouldFail}
              onChange={(e) => setShouldFail(e.target.checked)}
            />{' '}
            Simulate random failures (30% chance)
          </label>
        </div>
      </div>

      <div>
        <h3>Processed Batches ({processedBatches.length})</h3>
        <div>
          {processedBatches.length === 0 ? (
            <em>No batches processed yet</em>
          ) : (
            processedBatches.map((batch, index) => (
              <div key={batch.timestamp}>
                <strong>Batch {index + 1}</strong> (processed at{' '}
                {new Date(batch.timestamp).toLocaleTimeString()})
                <div>{batch.result}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div>
          <h3>Errors ({errors.length})</h3>
          <div>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
          <button onClick={() => setErrors([])}>Clear Errors</button>
        </div>
      )}

      <div>
        <h4>How it works:</h4>
        <ul>
          <li>Items are batched up to 5 at a time</li>
          <li>Batches are processed after 3 seconds if not full</li>
          <li>Items marked "urgent" trigger immediate processing</li>
          <li>Processing takes 1 second to simulate async work</li>
          <li>Each batch returns a result showing what was processed</li>
          <li>Errors are handled gracefully and don't stop the batcher</li>
          <li>
            The asyncBatch function is wrapped in useCallback for performance
          </li>
        </ul>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
