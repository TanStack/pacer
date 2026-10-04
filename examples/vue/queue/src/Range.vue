<script setup lang="ts">
import { ref } from 'vue'
import { queue } from '@tanstack/vue-pacer/queuer'

const queueItems = ref<Array<number>>([])

const processedCount = ref(0)

const currentValue = ref(50)

const queuedValue = ref(50)

function processQueueItem(item: number) {
  queuedValue.value = item
}

// Create the simplified queuer function
const queueValue = queue<number>(processQueueItem, {
  key: 'Range Change Queue',
  maxSize: 100,
  wait: 100,
  onItemsChange: (queue) => {
    queueItems.value = queue.peekAllItems()
  },
  onExecute: (_item, queue) => {
    processedCount.value = queue.store.state.executionCount
  },
})

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  queueValue(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer queue Example 3</h1>
    <div :style="{ marginBottom: '20px' }">
      <label
        >Current Range:<input
          type="range"
          min="0"
          max="100"
          :value="currentValue"
          @input="handleRangeChange"
          :style="{ width: '100%' }"
        /><span>{{ currentValue }}</span></label
      >
    </div>
    <div :style="{ marginBottom: '20px' }">
      <label
        >Queued Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          :value="queuedValue"
          disabled
          :style="{ width: '100%' }"
        /><span>{{ queuedValue }}</span></label
      >
    </div>
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
  </div>
</template>
