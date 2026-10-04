<script lang="ts">
  import { asyncBatch } from '@tanstack/svelte-pacer/async-batcher'
  const fakeProcessingTime = 1000
  type Item = {
    id: number
    value: string
    timestamp: number
  }
  let processedBatches = $state<
    Array<{
      items: Array<Item>
      result: string
      timestamp: number
    }>
  >([])

  let errors = $state<Array<string>>([])

  let pendingItems = $state<Array<Item>>([])

  let isProcessing = $state(false)

  let shouldFail = $state(false)

  let successCount = $state(0)

  let errorCount = $state(0)

  // The async function that will process a batch of items
  const processBatch = async (items: Array<Item>): Promise<string> => {
    console.log('Processing batch of', items.length, 'items:', items)
    isProcessing = true
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
      processedBatches = [
        ...processedBatches,
        { items, result, timestamp: Date.now() },
      ]
      successCount = successCount + 1
      console.log('Batch succeeded:', result)
      return result
    } catch (error: any) {
      errors = [
        ...errors,
        `Error: ${error} (${new Date().toLocaleTimeString()})`,
      ]
      errorCount = errorCount + 1
      console.error('Batch failed:', error)
      throw error
    } finally {
      isProcessing = false
    }
  }

  let addToBatch = $state(
    asyncBatch<Item>(processBatch, {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) =>
        items.some((item) => item.value.includes('urgent')),
      throwOnError: false, // Don't throw errors, handle them in the processBatch function
      onItemsChange: (batcher) => {
        pendingItems = batcher.peekAllItems()
      },
      onSuccess: (result, batch, batcher) => {
        console.log('AsyncBatcher succeeded:', result)
        console.log('Processed batch:', batch)
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
      onSettled: (batch, batcher) => {
        console.log('Batch settled:', batch)
        console.log(
          'Total processed items:',
          batcher.store.state.totalItemsProcessed,
        )
      },
    }),
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
</script>

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
    <div style="min-height: 100px">
      {#if pendingItems.length === 0}<em>No items pending</em
        >{:else}{#each pendingItems as item, index (index)}<div>
            {index + 1}: {item.value} (added at{' '}{new Date(
              item.timestamp,
            ).toLocaleTimeString()})
          </div>{/each}{/if}
    </div>
  </div>
  <div>
    <h3>Controls</h3>
    <div
      style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px"
    >
      <button onclick={() => addItem(false)}>Add Regular Item</button><button
        onclick={() => addItem(true)}
      >
        Add Urgent Item (Processes Immediately)
      </button>
    </div>
    <div>
      <label
        ><input
          type="checkbox"
          checked={shouldFail}
          oninput={(e) => (shouldFail = (e.target as HTMLInputElement).checked)}
        />{' '}Simulate random failures (30% chance)</label
      >
    </div>
  </div>
  <div>
    <h3>Processed Batches ({processedBatches.length})</h3>
    <div>
      {#if processedBatches.length === 0}<em>No batches processed yet</em
        >{:else}{#each processedBatches as batch, index (index)}<div>
            <strong>Batch {index + 1}</strong> (processed at{' '}{new Date(
              batch.timestamp,
            ).toLocaleTimeString()})
            <div>{batch.result}</div>
          </div>{/each}{/if}
    </div>
  </div>
  {#if errors.length > 0}<div>
      <h3>Errors ({errors.length})</h3>
      <div>
        {#each errors as error, index (index)}<div>{error}</div>{/each}
      </div>
      <button onclick={() => (errors = [])}>Clear Errors</button>
    </div>{/if}
</div>
