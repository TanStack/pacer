<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { batch } from '@tanstack/vue-pacer/batcher'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const processedBatches = ref<Array<Array<number>>>([])

const batchItems = ref<Array<number>>([])

// Create the batcher once during setup.
const addToBatch = batch<number>(
  (items) => {
    processedBatches.value = [...processedBatches.value, items]
    console.log('Processing batch', items)
  },
  {
    maxSize: 5,
    wait: 3000,
    getShouldExecute: (items) => items.includes(42),
    onItemsChange: (batcherInstance) => {
      batchItems.value = batcherInstance.peekAllItems()
    },
  },
)
</script>

<template>
  <div>
    <h1>TanStack Pacer batcher Example</h1>
    <div>Batch Items: {{ batchItems.join(', ') }}</div>
    <div>
      {{ 'Processed Batches: '
      }}<template v-for="(b, i) in processedBatches" :key="i"
        ><span>[{{ b.join(', ') }}], </span></template
      >
    </div>
    <button
      @click="
        () => {
          const nextNumber = batchItems.length
            ? batchItems[batchItems.length - 1]! + 1
            : 1
          addToBatch(nextNumber)
        }
      "
    >
      Add Number
    </button>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
