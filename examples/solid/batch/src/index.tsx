import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { batch } from '@tanstack/solid-pacer/batcher'

function App1() {
  const [batchItems, setBatchItems] = createSignal<Array<number>>([])
  const [processedBatches, setProcessedBatches] = createSignal<
    Array<Array<number>>
  >([])

  // Create the batcher function
  const addToBatch = batch<number>(
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
  )

  return (
    <div>
      <h1>TanStack Pacer batcher Example 1</h1>
      <div>Batch Items: {batchItems().join(', ')}</div>
      <div>
        Processed Batches:{' '}
        <For each={processedBatches()}>
          {(b) => <span>[{b.join(', ')}], </span>}
        </For>
      </div>
      <button
        onClick={() => {
          const nextNumber = batchItems().length
            ? batchItems()[batchItems().length - 1] + 1
            : 1
          addToBatch(nextNumber)
        }}
      >
        Add Number
      </button>
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
