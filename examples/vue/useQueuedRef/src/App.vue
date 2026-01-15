<script setup lang="ts">
import { ref } from 'vue'
import { useQueuedRef } from '@tanstack/vue-pacer/queuer'

const inputValue = ref('')
let itemId = 0

const [queuedValue, setQueuedValue, queuer] = useQueuedRef<{
  id: number
  text: string
} | null>(null, { wait: 1000, started: true }, (state) => ({
  items: state.items,
  size: state.size,
  executionCount: state.executionCount,
  status: state.status,
  isEmpty: state.isEmpty,
}))

const processedItems = ref<Array<{ id: number; text: string }>>([])

// Watch for processed items
const originalQueuedValue = queuedValue
setInterval(() => {
  if (
    originalQueuedValue.value &&
    !processedItems.value.find((i) => i.id === originalQueuedValue.value?.id)
  ) {
    processedItems.value.push(originalQueuedValue.value)
  }
}, 100)

function handleAddItem() {
  if (!inputValue.value.trim()) return
  itemId++
  setQueuedValue({ id: itemId, text: inputValue.value })
  inputValue.value = ''
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleAddItem()
  }
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useQueuedRef Example</h1>

    <div style="margin-bottom: 20px">
      <label for="item">Add Item: </label>
      <input
        id="item"
        type="text"
        v-model="inputValue"
        @keydown="handleKeyDown"
        placeholder="Enter item text..."
        style="padding: 8px; font-size: 16px; width: 250px"
      />
      <button
        @click="handleAddItem"
        style="padding: 8px 16px; font-size: 16px; margin-left: 8px"
      >
        Add to Queue
      </button>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Queuer State</h3>
      <p><strong>Status:</strong> {{ queuer.state.value.status }}</p>
      <p><strong>Queue Size:</strong> {{ queuer.state.value.size }}</p>
      <p><strong>Is Empty:</strong> {{ queuer.state.value.isEmpty }}</p>
      <p>
        <strong>Execution Count:</strong>
        {{ queuer.state.value.executionCount }}
      </p>
    </div>

    <div style="display: flex; gap: 40px">
      <div>
        <h3>Pending Items ({{ queuer.state.value.size }})</h3>
        <ul style="list-style: none; padding: 0">
          <li
            v-for="item in queuer.state.value.items"
            :key="item.id"
            style="
              padding: 8px;
              margin: 4px 0;
              background: #fff3cd;
              border-radius: 4px;
            "
          >
            #{{ item.id }}: {{ item.text }}
          </li>
          <li
            v-if="queuer.state.value.items.length === 0"
            style="color: #666; font-style: italic"
          >
            No pending items
          </li>
        </ul>
      </div>

      <div>
        <h3>Last Processed</h3>
        <p v-if="queuedValue">
          <strong>#{{ queuedValue.id }}:</strong> {{ queuedValue.text }}
        </p>
        <p v-else style="color: #666; font-style: italic">
          No items processed yet
        </p>
      </div>
    </div>

    <div style="margin-top: 20px">
      <h3>How it works</h3>
      <p>
        Items are added to a queue and processed one by one with a 1 second
        delay between each. The <code>queuedValue</code> ref updates each time
        an item is processed from the queue.
      </p>
    </div>
  </div>
</template>
