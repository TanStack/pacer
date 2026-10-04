<script setup lang="ts">
import { ref } from 'vue'
import { asyncBatch } from '@tanstack/vue-pacer/async-batcher'
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

const pendingItems = ref<Array<Item>>([])

const isProcessing = ref(false)

const shouldFail = ref(false)

const successCount = ref(0)

const errorCount = ref(0)

// The async function that will process a batch of items
const processBatch = async (items: Array<Item>): Promise<string> => {
  console.log('Processing batch of', items.length, 'items:', items)
  isProcessing.value = true
  try {
    // Simulate async processing time
    await new Promise((resolve) => setTimeout(resolve, fakeProcessingTime))
    // Simulate occasional failures for demo purposes
    if (shouldFail.value && Math.random() < 0.3) {
      throw new Error(`Processing failed for batch with ${items.length} items`)
    }
    // Return a result from the batch processing
    const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
    processedBatches.value = [
      ...processedBatches.value,
      { items, result, timestamp: Date.now() },
    ]
    successCount.value = successCount.value + 1
    console.log('Batch succeeded:', result)
    return result
  } catch (error: any) {
    errors.value = [
      ...errors.value,
      `Error: ${error} (${new Date().toLocaleTimeString()})`,
    ]
    errorCount.value = errorCount.value + 1
    console.error('Batch failed:', error)
    throw error
  } finally {
    isProcessing.value = false
  }
}

const addToBatch = ref(
  asyncBatch<Item>(processBatch, {
    maxSize: 5,
    wait: 3000,
    getShouldExecute: (items) =>
      items.some((item) => item.value.includes('urgent')),
    throwOnError: false, // Don't throw errors, handle them in the processBatch function
    onItemsChange: (batcher) => {
      pendingItems.value = batcher.peekAllItems()
    },
    onSuccess: (result, batch, batcher) => {
      console.log('AsyncBatcher succeeded:', result)
      console.log('Processed batch:', batch)
      console.log('Total successful batches:', batcher.store.state.successCount)
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
  addToBatch.value(item)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer asyncBatch Example</h1>
    <div>
      <h3>Batch Status</h3>
      <div>Pending Items: {{ pendingItems.length }}</div>
      <div>Max Batch Size: 5</div>
      <div>Is Processing: {{ isProcessing ? 'Yes' : 'No' }}</div>
      <div>Successful Batches: {{ successCount }}</div>
      <div>Failed Batches: {{ errorCount }}</div>
    </div>
    <div>
      <h3>Current Pending Items</h3>
      <div :style="{ minHeight: '100px' }">
        <template v-if="pendingItems.length === 0"
          ><em>No items pending</em></template
        ><template v-else
          ><template v-for="(item, index) in pendingItems" :key="index"
            ><div>
              {{ index + 1 }}: {{ item.value }} (added at{{ ' '
              }}{{ new Date(item.timestamp).toLocaleTimeString() }})
            </div></template
          ></template
        >
      </div>
    </div>
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
          Add Urgent Item (Processes Immediately)
        </button>
      </div>
      <div>
        <label
          ><input
            type="checkbox"
            :checked="shouldFail"
            @input="
              (e) => (shouldFail = (e.target as HTMLInputElement).checked)
            "
          />{{ ' ' }}Simulate random failures (30% chance)</label
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
    >
  </div>
</template>
