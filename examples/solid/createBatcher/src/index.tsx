import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createBatcher } from '@tanstack/solid-pacer/batcher'

function App1() {
  const [processedBatches, setProcessedBatches] = createSignal<
    Array<Array<number>>
  >([])

  // Create the batcher instance
  const batcher = createBatcher<number>(
    (items) => {
      setProcessedBatches((prev) => [...prev, items])
      console.log('Processing batch', items)
    },
    {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) => items.includes(42),
    },
  )

  return (
    <div>
      <h1>TanStack Pacer createBatcher Example 1</h1>
      <div>Batch Size: {batcher.size()}</div>
      <div>Batch Max Size: {5}</div>
      <div>Batch Items: {batcher.allItems().join(', ')}</div>
      <div>Batches Processed: {batcher.batchExecutionCount()}</div>
      <div>Items Processed: {batcher.itemExecutionCount()}</div>
      <div>
        Processed Batches:{' '}
        <For each={processedBatches()}>
          {(b) => <span>[{b.join(', ')}], </span>}
        </For>
      </div>
      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(2, 1fr)',
          gap: '8px',
          'max-width': '600px',
          margin: '16px 0',
        }}
      >
        <button
          onClick={() => {
            const nextNumber = batcher.allItems().length
              ? batcher.allItems()[batcher.allItems().length - 1] + 1
              : 1
            batcher.addItem(nextNumber)
          }}
        >
          Add Number
        </button>
        <button
          disabled={batcher.size() === 0}
          onClick={() => {
            batcher.execute()
          }}
        >
          Process Current Batch
        </button>
        <button onClick={() => batcher.stop()} disabled={!batcher.isRunning()}>
          Stop Batching
        </button>
        <button onClick={() => batcher.start()} disabled={batcher.isRunning()}>
          Start Batching
        </button>
      </div>
    </div>
  )
}

render(
  () => (
    <div>
      <App1 />
    </div>
  ),
  document.getElementById('root')!,
)
