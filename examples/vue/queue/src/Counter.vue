<script setup lang="ts">
import { ref } from 'vue'
import { queue } from '@tanstack/vue-pacer/queuer'

const queueItems = ref<Array<number>>([])

const processedCount = ref(0)

function processQueueItem(item: number) {
  console.log('Processing item:', item)
}

// Create the simplified queuer function
const queueItem = queue<number>(processQueueItem, {
  key: 'Add Number Queue',
  maxSize: 25,
  wait: 1000,
  onItemsChange: (queue) => {
    queueItems.value = queue.peekAllItems()
  },
  onExecute: (_item, queue) => {
    processedCount.value = queue.store.state.executionCount
  },
})
</script>
<template>
  <div>
    <h1>TanStack Pacer queue Example 1</h1>
    <table>
      <tbody>
        <tr>
          <td>Queue Size:</td>
          <td>{{ queueItems.length }}</td>
        </tr>
        <tr>
          <td>Items Processed:</td>
          <td>{{ processedCount }}</td>
        </tr>
        <tr>
          <td>Queue Items:</td>
          <td>{{ queueItems.join(', ') }}</td>
        </tr>
      </tbody>
    </table>
    <button
      @click="
        () => {
          const nextNumber = queueItems.length
            ? queueItems[queueItems.length - 1]! + 1
            : 1
          queueItem(nextNumber)
        }
      "
      :disabled="queueItems.length >= 25"
    >
      Add Number
    </button>
  </div>
</template>
