<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { batch } from '@tanstack/svelte-pacer/batcher'

  let processedBatches = $state<Array<Array<number>>>([])

  let batchItems = $state<Array<number>>([])

  // Create the batcher once during component initialization.
  const addToBatch = batch<number>(
    (items) => {
      processedBatches = [...processedBatches, items]
      console.log('Processing batch', items)
    },
    {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) => items.includes(42),
      onItemsChange: (batcherInstance) => {
        batchItems = batcherInstance.peekAllItems()
      },
    },
  )
</script>

<div>
  <h1>TanStack Pacer batcher Example</h1>
  <div>Batch Items: {batchItems.join(', ')}</div>
  <div>
    {'Processed Batches: '}{#each processedBatches as b, i (i)}<span
        >[{b.join(', ')}],
      </span>{/each}
  </div>
  <button
    onclick={() => {
      const nextNumber = batchItems.length
        ? batchItems[batchItems.length - 1]! + 1
        : 1
      addToBatch(nextNumber)
    }}
  >
    Add Number
  </button>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
