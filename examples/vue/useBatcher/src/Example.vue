<script setup lang="ts">
import { ref } from 'vue'
import { useBatcher } from '@tanstack/vue-pacer/batcher'

const processedBatches = ref<Array<Array<number>>>([])

// The function that will process a batch of items
function processBatch(items: Array<number>) {
  processedBatches.value = [...processedBatches.value, items]
  console.log('processing batch', items)
}

const batcher = useBatcher(processBatch, () => ({
  key: 'useBatcher',
  // started: false, // true by default
  maxSize: 5, // Process in batches of 5 (if comes before wait time)
  wait: 3000, // wait up to 3 seconds before processing a batch (if time elapses before maxSize is reached)
  getShouldExecute: (items, _batcher) => items.includes(42), // or pass in a custom function to determine if the batch should be processed
}))
</script>
<template>
  <div>
    <h1>TanStack Pacer useBatcher Example 1</h1>
    <batcher.Subscribe
      :selector="
        (state) => ({
          size: state.size,
          executionCount: state.executionCount,
          totalItemsProcessed: state.totalItemsProcessed,
        })
      "
      v-slot="{ size, executionCount, totalItemsProcessed }"
      ><div>Batch Size: {{ size }}</div>
      <div>Batch Max Size: {{ 5 }}</div>
      <div>Batch Items: {{ batcher.peekAllItems().join(', ') }}</div>
      <div>Batches Processed: {{ executionCount }}</div>
      <div>Items Processed: {{ totalItemsProcessed }}</div>
      <div>
        Processed Batches:{{ ' '
        }}<template v-for="(b, i) in processedBatches" :key="i"
          ><span>[{{ b.join(', ') }}]</span>,{{ ' ' }}</template
        >
      </div>
      <div
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          maxWidth: '600px',
          margin: '16px 0',
        }"
      >
        <button
          @click="
            () => {
              const nextNumber = batcher.peekAllItems().length
                ? batcher.peekAllItems()[batcher.peekAllItems().length - 1]! + 1
                : 1
              batcher.addItem(nextNumber)
            }
          "
        >
          Add Number</button
        ><button
          :disabled="size === 0"
          @click="
            () => {
              batcher.flush()
            }
          "
        >
          Flush Current Batch
        </button>
      </div></batcher.Subscribe
    ><batcher.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </batcher.Subscribe>
  </div>
</template>
