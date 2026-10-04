import { createRoot, useLayoutEffect } from 'octane'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { useState } from 'octane'
import { useAsyncBatcher } from '@tanstack/octane-pacer/async-batcher'
import { PacerProvider } from '@tanstack/octane-pacer/provider'
const fakeProcessingTime = 1000
type Item = {
  id: number
  value: string
  timestamp: number
}

function App() @{
  const [processedBatches, setProcessedBatches] = useState<
    Array<{ items: Array<Item>; result: string; timestamp: number }>
  >([])
  const [errors, setErrors] = useState<Array<string>>([])
  async function processBatch(items: Array<Item>): Promise<string> {
    console.log('Processing batch of', items.length, 'items:', items)

    // Simulate async processing time
    await new Promise((resolve) => setTimeout(resolve, fakeProcessingTime))

    // Simulate occasional failures for demo purposes

    // throw new Error(`Processing failed for batch with ${items.length} items`)

    // Return a result from the batch processing
    const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`

    setProcessedBatches((prev) => [
      ...prev,
      { items, result, timestamp: Date.now() },
    ])

    return result
  }
  const asyncBatcher = useAsyncBatcher(
    processBatch,
    {
      key: 'useAsyncBatcher',
      maxSize: 5, // Process in batches of 5 (if reached before wait time)
      wait: 4000, // Wait up to 4 seconds before processing a batch
      getShouldExecute: (items) =>
        items.some((item) => item.value.includes('urgent')), // Process immediately if any item is marked urgent
      throwOnError: false, // Don't throw errors, handle them via onError
      onSuccess: (result, batch, batcher) => {
        console.log('Batch succeeded:', result)
        console.log('Processed batch:', batch)
        console.log(
          'Total successful batches:',
          batcher.store.state.successCount,
        )
      },
      onError: (error: any, _batcher) => {
        console.error('Batch failed:', error)
        setErrors((prev) => [
          ...prev,
          `Error: ${error} (${new Date().toLocaleTimeString()})`,
        ])
      },
      onSettled: (batch, batcher) => {
        console.log('Batch settled:', batch)
        console.log(
          'Total processed items:',
          batcher.store.state.totalItemsProcessed,
        )
      },
    },
    // Alternative to asyncBatcher.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
    (state) => state,
  )
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
  <div>
    <h1>TanStack Pacer useAsyncBatcher Example</h1>
    <div>
      <h3>Batch Status</h3>
      <div>Current Batch Size: {asyncBatcher.state.size}</div>
      <div>Max Batch Size: 5</div>
      <div>Is Executing: {asyncBatcher.state.isExecuting ? 'Yes' : 'No'}</div>
      <div>Status: {asyncBatcher.state.status}</div>
      <div>Successful Batches: {asyncBatcher.state.successCount}</div>
      <div>Failed Batches: {asyncBatcher.state.errorCount}</div>
      <div>Total Items Processed: {asyncBatcher.state.totalItemsProcessed}</div>
    </div>
    <div>
      <h3>Current Batch Items</h3>
      <div style={{ minHeight: '100px' }}>
        @if (asyncBatcher.state.items.length === 0) {
          <em>No items in current batch</em>
        } @else {
          @for (
            const item of asyncBatcher.state.items;
            index index;
            key item.id
          ) {
            <div key={item.id}>
              {index + 1}: {item.value} (added at{' '}
              {new Date(item.timestamp).toLocaleTimeString()})
            </div>
          }
        }
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
        <>
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
        </>
      </div>
    </div>
    <div>
      <h3>Processed Batches ({processedBatches.length})</h3>
      <div>
        @if (processedBatches.length === 0) {
          <em>No batches processed yet</em>
        } @else {
          @for (
            const batch of processedBatches;
            index index;
            key batch.timestamp
          ) {
            <div key={batch.timestamp}>
              <strong>Batch {index + 1}</strong> (processed at{' '}
              {new Date(batch.timestamp).toLocaleTimeString()})
              <div>{batch.result}</div>
            </div>
          }
        }
      </div>
    </div>
    @if (errors.length > 0) {
      <div>
        <h3>Errors ({errors.length})</h3>
        <div>
          @for (const error of errors; index index; key index) {
            <div key={index}>{error}</div>
          }
        </div>
        <button onClick={() => setErrors([])}>Clear Errors</button>
      </div>
    }
    <pre style={{ marginTop: '20px' }}>
      {JSON.stringify(asyncBatcher.state, null, 2)}
    </pre>
  </div>
}

function PacerExample() @{
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return
    const target = document.createElement('div')
    document.body.append(target)
    const host = new TanStackDevtoolsCore({ plugins: [pacerDevtoolsPlugin()] })
    host.mount(target)
    return () => {
      host.unmount()
      target.remove()
    }
  }, [])
  // Keep Solid's document-level devtools delegation outside Octane's application events.
  <div
    onClick={(event) => event.stopPropagation()}
    onInput={(event) => event.stopPropagation()}
  >
    <PacerProvider
    // defaultOptions={{
    //   batcher: {
    //     maxSize: 10,
    //   },
    // }}
    >
      <App />
    </PacerProvider>
  </div>
}
createRoot(document.getElementById('app')!).render(PacerExample)
