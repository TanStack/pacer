<script setup lang="ts">
import { ref } from 'vue'
import { queue } from '@tanstack/vue-pacer/queuer'

const queueItems = ref<Array<string>>([])

const processedCount = ref(0)

const inputText = ref('')

const queuedText = ref('')

function processQueueItem(item: string) {
  queuedText.value = item
}

// Create the simplified queuer function
const queueTextChange = queue<string>(processQueueItem, {
  key: 'Text Change Queue',
  maxSize: 100,
  wait: 500,
  onItemsChange: (queue) => {
    queueItems.value = queue.peekAllItems()
  },
  onExecute: (_item, queue) => {
    processedCount.value = queue.store.state.executionCount
  },
})

function handleInputChange(e: Event) {
  inputText.value = (e.target as HTMLInputElement).value
  queueTextChange((e.target as HTMLInputElement).value)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer queue Example 2</h1>
    <div>
      <input
        type="search"
        :value="inputText"
        @input="handleInputChange"
        placeholder="Type to add to queue..."
        :style="{ width: '100%' }"
      />
    </div>
    <table>
      <tbody>
        <tr>
          <td>Queued Text:</td>
          <td>{{ queuedText }}</td>
        </tr>
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
