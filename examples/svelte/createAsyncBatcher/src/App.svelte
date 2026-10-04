<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createAsyncBatcher } from '@tanstack/svelte-pacer/async-batcher'

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

  // The async function that will process a batch of items
  async function processBatch(items: Array<Item>): Promise<string> {
    console.log('Processing batch of', items.length, 'items:', items)
    // Simulate async processing time
    await new Promise((resolve) => setTimeout(resolve, fakeProcessingTime))
    // Simulate occasional failures for demo purposes
    // throw new Error(`Processing failed for batch with ${items.length} items`)
    // Return a result from the batch processing
    const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
    processedBatches = [
      ...processedBatches,
      { items, result, timestamp: Date.now() },
    ]
    return result
  }

  const asyncBatcher = createAsyncBatcher(processBatch, () => ({
    key: 'createAsyncBatcher',
    maxSize: 5, // Process in batches of 5 (if reached before wait time)
    wait: 4000, // Wait up to 4 seconds before processing a batch
    getShouldExecute: (items) =>
      items.some((item) => item.value.includes('urgent')), // Process immediately if any item is marked urgent
    throwOnError: false, // Don't throw errors, handle them via onError
    onSuccess: (result, batch, batcher) => {
      console.log('Batch succeeded:', result)
      console.log('Processed batch:', batch)
      console.log('Total successful batches:', batcher.store.state.successCount)
    },
    onError: (error: any, _batcher) => {
      console.error('Batch failed:', error)
      errors = [
        ...errors,
        `Error: ${error} (${new Date().toLocaleTimeString()})`,
      ]
    },
    onSettled: (batch, batcher) => {
      console.log('Batch settled:', batch)
      console.log(
        'Total processed items:',
        batcher.store.state.totalItemsProcessed,
      )
    },
  }))

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
</script>

<div>
  <h1>TanStack Pacer createAsyncBatcher Example</h1>
  <asyncBatcher.Subscribe
    selector={(state) => ({
      size: state.size,
      isExecuting: state.isExecuting,
      status: state.status,
      successCount: state.successCount,
      errorCount: state.errorCount,
      totalItemsProcessed: state.totalItemsProcessed,
    })}
    >{#snippet children({
      size,
      isExecuting,
      status,
      successCount,
      errorCount,
      totalItemsProcessed,
    })}<div>
        <h3>Batch Status</h3>
        <div>Current Batch Size: {size}</div>
        <div>Max Batch Size: 5</div>
        <div>Is Executing: {isExecuting ? 'Yes' : 'No'}</div>
        <div>Status: {status}</div>
        <div>Successful Batches: {successCount}</div>
        <div>Failed Batches: {errorCount}</div>
        <div>Total Items Processed: {totalItemsProcessed}</div>
      </div>{/snippet}</asyncBatcher.Subscribe
  ><asyncBatcher.Subscribe selector={(state) => ({ items: state.items })}
    >{#snippet children({ items })}<div>
        <h3>Current Batch Items</h3>
        <div style="min-height: 100px">
          {#if items.length === 0}<em>No items in current batch</em
            >{:else}{#each items as item, index (index)}<div>
                {index + 1}: {item.value} (added at{' '}{new Date(
                  item.timestamp,
                ).toLocaleTimeString()})
              </div>{/each}{/if}
        </div>
      </div>{/snippet}</asyncBatcher.Subscribe
  >
  <div>
    <h3>Controls</h3>
    <div
      style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px"
    >
      <button onclick={() => addItem(false)}>Add Regular Item</button><button
        onclick={() => addItem(true)}
      >
        Add Urgent Item (Processes Immediately)</button
      ><asyncBatcher.Subscribe
        selector={(state) => ({
          size: state.size,
          isExecuting: state.isExecuting,
        })}
        >{#snippet children({ size, isExecuting })}<button
            disabled={size === 0 || isExecuting}
            onclick={executeCurrentBatch}
          >
            Process Current Batch Now</button
          ><button
            onclick={() => asyncBatcher.clear()}
            disabled={size === 0 || isExecuting}
          >
            Clear Current Batch
          </button>{/snippet}</asyncBatcher.Subscribe
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
    </div>{/if}<asyncBatcher.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</asyncBatcher.Subscribe
  >
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
