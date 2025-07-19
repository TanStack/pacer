import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createBatcher } from '@tanstack/solid-pacer/batcher'

function App1() {
  const [processedBatches, setProcessedBatches] = createSignal<
    Array<Array<number>>
  >([])

  // Create the batcher instance
  const batcher = createBatcher(
    (items: Array<number>) => {
      setProcessedBatches((prev) => [...prev, items])
      console.log('Processing batch', items)
    },
    {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) => items.includes(42),
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      size: state.size,
      items: state.items,
      executionCount: state.executionCount,
      totalItemsProcessed: state.totalItemsProcessed,
    }),
  )

  return (
    <div>
      <h1>TanStack Pacer createBatcher Example 1</h1>
      <div>Batch Size: {batcher.state().size}</div>
      <div>Batch Max Size: {5}</div>
      <div>Batch Items: {batcher.state().items.join(', ')}</div>
      <div>Batches Processed: {batcher.state().executionCount}</div>
      <div>Items Processed: {batcher.state().totalItemsProcessed}</div>
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
            const nextNumber = batcher.state().items.length
              ? batcher.state().items[batcher.state().items.length - 1] + 1
              : 1
            batcher.addItem(nextNumber)
          }}
        >
          Add Number
        </button>
        <button
          disabled={batcher.state().size === 0}
          onClick={() => {
            batcher.flush()
          }}
        >
          Process Current Batch
        </button>
      </div>
      <pre style={{ 'margin-top': '20px' }}>
        {JSON.stringify(batcher.state(), null, 2)}
      </pre>
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
