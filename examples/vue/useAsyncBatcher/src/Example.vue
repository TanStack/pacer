<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncBatcher } from '@tanstack/vue-pacer/async-batcher'
const fakeProcessingTime = 1000
type Item = {
  id: number
  value: string
  timestamp: number
}
const processedBatches = ref<
  Array<{
    items: Array<Item>
    result: string
    timestamp: number
  }>
>([])

const errors = ref<Array<string>>([])

// The async function that will process a batch of items
async function processBatch(items: Array<Item>): Promise<string> {
  console.log('Processing batch of', items.length, 'items:', items)
  // Simulate async processing time
  await new Promise((resolve) => setTimeout(resolve, fakeProcessingTime))
  // Simulate occasional failures for demo purposes
  // throw new Error(`Processing failed for batch with ${items.length} items`)
  // Return a result from the batch processing
  const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
  processedBatches.value = [
    ...processedBatches.value,
    { items, result, timestamp: Date.now() },
  ]
  return result
}

const asyncBatcher = useAsyncBatcher(processBatch, () => ({
  key: 'useAsyncBatcher',
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
    errors.value = [
      ...errors.value,
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
<template>
  <div>
    <h1>TanStack Pacer useAsyncBatcher Example</h1>
    <asyncBatcher.Subscribe
      :selector="
        (state) => ({
          size: state.size,
          isExecuting: state.isExecuting,
          status: state.status,
          successCount: state.successCount,
          errorCount: state.errorCount,
          totalItemsProcessed: state.totalItemsProcessed,
        })
      "
      v-slot="{
        size,
        isExecuting,
        status,
        successCount,
        errorCount,
        totalItemsProcessed,
      }"
      ><div>
        <h3>Batch Status</h3>
        <div>Current Batch Size: {{ size }}</div>
        <div>Max Batch Size: 5</div>
        <div>Is Executing: {{ isExecuting ? 'Yes' : 'No' }}</div>
        <div>Status: {{ status }}</div>
        <div>Successful Batches: {{ successCount }}</div>
        <div>Failed Batches: {{ errorCount }}</div>
        <div>Total Items Processed: {{ totalItemsProcessed }}</div>
      </div></asyncBatcher.Subscribe
    ><asyncBatcher.Subscribe
      :selector="(state) => ({ items: state.items })"
      v-slot="{ items }"
      ><div>
        <h3>Current Batch Items</h3>
        <div :style="{ minHeight: '100px' }">
          <template v-if="items.length === 0"
            ><em>No items in current batch</em></template
          ><template v-else
            ><template v-for="(item, index) in items" :key="index"
              ><div>
                {{ index + 1 }}: {{ item.value }} (added at{{ ' '
                }}{{ new Date(item.timestamp).toLocaleTimeString() }})
              </div></template
            ></template
          >
        </div>
      </div></asyncBatcher.Subscribe
    >
    <div>
      <h3>Controls</h3>
      <div
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          maxWidth: '600px',
        }"
      >
        <button @click="() => addItem(false)">Add Regular Item</button
        ><button @click="() => addItem(true)">
          Add Urgent Item (Processes Immediately)</button
        ><asyncBatcher.Subscribe
          :selector="
            (state) => ({
              size: state.size,
              isExecuting: state.isExecuting,
            })
          "
          v-slot="{ size, isExecuting }"
          ><button
            :disabled="size === 0 || isExecuting"
            @click="executeCurrentBatch"
          >
            Process Current Batch Now</button
          ><button
            @click="() => asyncBatcher.clear()"
            :disabled="size === 0 || isExecuting"
          >
            Clear Current Batch
          </button></asyncBatcher.Subscribe
        >
      </div>
    </div>
    <div>
      <h3>Processed Batches ({{ processedBatches.length }})</h3>
      <div>
        <template v-if="processedBatches.length === 0"
          ><em>No batches processed yet</em></template
        ><template v-else
          ><template v-for="(batch, index) in processedBatches" :key="index"
            ><div>
              <strong>Batch {{ index + 1 }}</strong> (processed at{{ ' '
              }}{{ new Date(batch.timestamp).toLocaleTimeString() }})
              <div>{{ batch.result }}</div>
            </div></template
          ></template
        >
      </div>
    </div>
    <template v-if="errors.length > 0"
      ><div>
        <h3>Errors ({{ errors.length }})</h3>
        <div>
          <template v-for="(error, index) in errors" :key="index"
            ><div>{{ error }}</div></template
          >
        </div>
        <button @click="() => (errors = [])">Clear Errors</button>
      </div></template
    ><asyncBatcher.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </asyncBatcher.Subscribe>
  </div>
</template>
