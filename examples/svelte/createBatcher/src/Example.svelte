<script lang="ts">
  import { createBatcher } from '@tanstack/svelte-pacer/batcher'

  let processedBatches = $state<Array<Array<number>>>([])

  // The function that will process a batch of items
  function processBatch(items: Array<number>) {
    processedBatches = [...processedBatches, items]
    console.log('processing batch', items)
  }

  const batcher = createBatcher(processBatch, () => ({
    key: 'createBatcher',
    // started: false, // true by default
    maxSize: 5, // Process in batches of 5 (if comes before wait time)
    wait: 3000, // wait up to 3 seconds before processing a batch (if time elapses before maxSize is reached)
    getShouldExecute: (items, _batcher) => items.includes(42), // or pass in a custom function to determine if the batch should be processed
  }))
</script>

<div>
  <h1>TanStack Pacer createBatcher Example 1</h1>
  <batcher.Subscribe
    selector={(state) => ({
      size: state.size,
      items: state.items,
      executionCount: state.executionCount,
      totalItemsProcessed: state.totalItemsProcessed,
    })}
    >{#snippet children({
      size,
      items,
      executionCount,
      totalItemsProcessed,
    })}<div>
        Batch Size: {size}
      </div>
      <div>Batch Max Size: {5}</div>
      <div>Batch Items: {items.join(', ')}</div>
      <div>Batches Processed: {executionCount}</div>
      <div>Items Processed: {totalItemsProcessed}</div>
      <div>
        Processed Batches:{' '}{#each processedBatches as b, i (i)}<span
            >[{b.join(', ')}]</span
          >,{' '}{/each}
      </div>
      <div
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0"
      >
        <button
          onclick={() => {
            const nextNumber = batcher.peekAllItems().length
              ? batcher.peekAllItems()[batcher.peekAllItems().length - 1]! + 1
              : 1
            batcher.addItem(nextNumber)
          }}
        >
          Add Number</button
        ><button
          disabled={size === 0}
          onclick={() => {
            batcher.flush()
          }}
        >
          Flush Current Batch
        </button>
      </div>{/snippet}</batcher.Subscribe
  ><batcher.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</batcher.Subscribe
  >
</div>
