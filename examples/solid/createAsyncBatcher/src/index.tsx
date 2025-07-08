import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createAsyncBatcher } from '@tanstack/solid-pacer/async-batcher'

const fakeProcessingTime = 1000

type Item = {
  id: number
  value: string
  timestamp: number
}

function App() {
  // Use your state management library of choice
  const [processedBatches, setProcessedBatches] = createSignal<
    Array<{ items: Array<Item>; result: string; timestamp: number }>
  >([])
  const [errors, setErrors] = createSignal<Array<string>>([])
  const [shouldFail, setShouldFail] = createSignal(false)

  // The async function that will process a batch of items
  async function processBatch(items: Array<Item>): Promise<string> {
    console.log('Processing batch of', items.length, 'items:', items)

    // Simulate async processing time
    await new Promise((resolve) => setTimeout(resolve, fakeProcessingTime))

    // Simulate occasional failures for demo purposes
    if (shouldFail() && Math.random() < 0.3) {
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

  const batcher = createAsyncBatcher(processBatch, {
    maxSize: 5, // Process in batches of 5 (if reached before wait time)
    wait: 2000, // Wait up to 2 seconds before processing a batch
    getShouldExecute: (items) =>
      items.some((item) => item.value.includes('urgent')), // Process immediately if any item is marked urgent
    throwOnError: false, // Don't throw errors, handle them via onError
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
    batcher.addItem(item)
  }

  const executeCurrentBatch = async () => {
    try {
      const result = await batcher.execute()
      console.log('Manual execution result:', result)
    } catch (error) {
      console.error('Manual execution failed:', error)
    }
  }

  return (
    <div>
      <h1>TanStack Pacer createAsyncBatcher Example</h1>

      <div>
        <h3>Batch Status</h3>
        <div>Current Batch Size: {batcher.state().size}</div>
        <div>Max Batch Size: 5</div>
        <div>Is Executing: {batcher.state().isExecuting ? 'Yes' : 'No'}</div>
        <div>Is Running: {batcher.state().isRunning ? 'Yes' : 'No'}</div>
        <div>Status: {batcher.state().status}</div>
        <div>Successful Batches: {batcher.state().successCount}</div>
        <div>Failed Batches: {batcher.state().errorCount}</div>
        <div>Total Items Processed: {batcher.state().totalItemsProcessed}</div>
      </div>

      <div>
        <h3>Current Batch Items</h3>
        <div style={{ 'min-height': '100px' }}>
          {batcher.state().items.length === 0 ? (
            <em>No items in current batch</em>
          ) : (
            <For each={batcher.state().items}>
              {(item, index) => (
                <div>
                  {index() + 1}: {item.value} (added at{' '}
                  {new Date(item.timestamp).toLocaleTimeString()})
                </div>
              )}
            </For>
          )}
        </div>
      </div>

      <div>
        <h3>Controls</h3>
        <div
          style={{
            display: 'grid',
            'grid-template-columns': 'repeat(2, 1fr)',
            gap: '8px',
            'max-width': '600px',
          }}
        >
          <button onClick={() => addItem(false)}>Add Regular Item</button>
          <button onClick={() => addItem(true)}>
            Add Urgent Item (Processes Immediately)
          </button>
          <button
            disabled={batcher.state().size === 0 || batcher.state().isExecuting}
            onClick={executeCurrentBatch}
          >
            Process Current Batch Now
          </button>
          <button
            onClick={() => batcher.clear()}
            disabled={batcher.state().size === 0 || batcher.state().isExecuting}
          >
            Clear Current Batch
          </button>
          <button
            onClick={() => batcher.stop()}
            disabled={!batcher.state().isRunning}
          >
            Stop Auto-Processing
          </button>
          <button
            onClick={() => batcher.start()}
            disabled={batcher.state().isRunning}
          >
            Start Auto-Processing
          </button>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={shouldFail()}
              onChange={(e) => setShouldFail(e.currentTarget.checked)}
            />{' '}
            Simulate random failures (30% chance)
          </label>
        </div>
      </div>

      <div>
        <h3>Processed Batches ({processedBatches().length})</h3>
        <div>
          {processedBatches().length === 0 ? (
            <em>No batches processed yet</em>
          ) : (
            <For each={processedBatches()}>
              {(batch, index) => (
                <div>
                  <strong>Batch {index() + 1}</strong> (processed at{' '}
                  {new Date(batch.timestamp).toLocaleTimeString()})
                  <div>{batch.result}</div>
                </div>
              )}
            </For>
          )}
        </div>
      </div>

      {errors().length > 0 && (
        <div>
          <h3>Errors ({errors().length})</h3>
          <div>
            <For each={errors()}>
              {(error, index) => (
                <div>
                  {index() + 1}: {error}
                </div>
              )}
            </For>
          </div>
          <button onClick={() => setErrors([])}>Clear Errors</button>
        </div>
      )}

      <div>
        <h4>How it works:</h4>
        <ul>
          <li>Items are batched up to 5 at a time</li>
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

render(() => <App />, document.getElementById('root')!)
