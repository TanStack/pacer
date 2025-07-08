import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncBatcher } from '@tanstack/react-pacer/async-batcher'

const fakeProcessingTime = 1000

type Item = {
  id: number
  value: string
  timestamp: number
}

function App() {
  // Use your state management library of choice
  const [batchItems, setBatchItems] = useState<Array<Item>>([])
  const [processedBatches, setProcessedBatches] = useState<
    Array<{ items: Array<Item>; result: string; timestamp: number }>
  >([])
  const [errors, setErrors] = useState<Array<string>>([])
  const [shouldFail, setShouldFail] = useState(false)

  // The async function that will process a batch of items
  async function processBatch(items: Array<Item>): Promise<string> {
    console.log('Processing batch of', items.length, 'items:', items)

    // Simulate async processing time
    await new Promise((resolve) => setTimeout(resolve, fakeProcessingTime))

    // Simulate occasional failures for demo purposes
    if (shouldFail && Math.random() < 0.3) {
      throw new Error(`Processing failed for batch with ${items.length} items`)
    }

    // Return a result from the batch processing
    const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`

    setProcessedBatches((prev) => [
      ...prev,
      { items, result, timestamp: Date.now() },
    ])

    return result
  }

  const asyncBatcher = useAsyncBatcher(processBatch, {
    maxSize: 5, // Process in batches of 3 (if reached before wait time)
    wait: 2000, // Wait up to 2 seconds before processing a batch
    getShouldExecute: (items) =>
      items.some((item) => item.value.includes('urgent')), // Process immediately if any item is marked urgent
    throwOnError: false, // Don't throw errors, handle them via onError
    onItemsChange: (batcher) => {
      setBatchItems(batcher.peekAllItems())
    },
    onSuccess: (result, batcher) => {
      console.log('Batch succeeded:', result)
      console.log('Total successful batches:', batcher.store.state.successCount)
    },
    onError: (error: any, _batcher) => {
      console.error('Batch failed:', error)
      setErrors((prev) => [
        ...prev,
        `Error: ${error.message} (${new Date().toLocaleTimeString()})`,
      ])
    },
    onSettled: (batcher) => {
      console.log(
        'Batch settled. Total processed items:',
        batcher.store.state.totalItemsProcessed,
      )
    },
  })

  const addItem = (isUrgent = false) => {
    const nextId = Date.now()
    const item: Item = {
      id: nextId,
      value: isUrgent ? `urgent-${nextId}` : `item-${nextId}`,
      timestamp: nextId,
    }
    asyncBatcher.addItem(item)
  }

  const executeCurrentBatch = async () => {
    try {
      const result = await asyncBatcher.flush()
      console.log('Manual execution result:', result)
    } catch (error) {
      console.error('Manual execution failed:', error)
    }
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncBatcher Example</h1>

      <div>
        <h3>Batch Status</h3>
        <div>Current Batch Size: {asyncBatcher.state.size}</div>
        <div>Max Batch Size: 5</div>
        <div>Is Executing: {asyncBatcher.state.isExecuting ? 'Yes' : 'No'}</div>
        <div>Is Running: {asyncBatcher.state.isRunning ? 'Yes' : 'No'}</div>
        <div>Status: {asyncBatcher.state.status}</div>
        <div>Successful Batches: {asyncBatcher.state.successCount}</div>
        <div>Failed Batches: {asyncBatcher.state.errorCount}</div>
        <div>
          Total Items Processed: {asyncBatcher.state.totalItemsProcessed}
        </div>
      </div>

      <div>
        <h3>Current Batch Items</h3>
        <div style={{ minHeight: '100px' }}>
          {batchItems.length === 0 ? (
            <em>No items in current batch</em>
          ) : (
            batchItems.map((item, index) => (
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
          <button
            disabled={
              asyncBatcher.state.size === 0 || asyncBatcher.state.isExecuting
            }
            onClick={executeCurrentBatch}
          >
            Process Current Batch Now
          </button>
          <button
            onClick={() => asyncBatcher.clear()}
            disabled={
              asyncBatcher.state.size === 0 || asyncBatcher.state.isExecuting
            }
          >
            Clear Current Batch
          </button>
          <button
            onClick={() => asyncBatcher.stop()}
            disabled={!asyncBatcher.state.isRunning}
          >
            Stop Auto-Processing
          </button>
          <button
            onClick={() => asyncBatcher.start()}
            disabled={asyncBatcher.state.isRunning}
          >
            Start Auto-Processing
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
          <li>Items are batched up to 3 at a time</li>
          <li>Batches are processed after 2 seconds if not full</li>
          <li>Items marked "urgent" trigger immediate processing</li>
          <li>Processing takes 1 second to simulate async work</li>
          <li>Each batch returns a result showing what was processed</li>
          <li>Errors are handled gracefully and don't stop the batcher</li>
        </ul>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
