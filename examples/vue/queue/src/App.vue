<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { queue } from '@tanstack/vue-pacer/queuer'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const counterQueueItems = ref<Array<number>>([])

const counterProcessedCount = ref(0)

function counterProcessQueueItem(item: number) {
  console.log('Processing item:', item)
}

// Create the simplified queuer function
const queueItem = queue<number>(counterProcessQueueItem, {
  key: 'Add Number Queue',
  maxSize: 25,
  wait: 1000,
  onItemsChange: (queue) => {
    counterQueueItems.value = queue.peekAllItems()
  },
  onExecute: (_item, queue) => {
    counterProcessedCount.value = queue.store.state.executionCount
  },
})

const searchQueueItems = ref<Array<string>>([])

const searchProcessedCount = ref(0)

const inputText = ref('')

const queuedText = ref('')

function searchProcessQueueItem(item: string) {
  queuedText.value = item
}

// Create the simplified queuer function
const queueTextChange = queue<string>(searchProcessQueueItem, {
  key: 'Text Change Queue',
  maxSize: 100,
  wait: 500,
  onItemsChange: (queue) => {
    searchQueueItems.value = queue.peekAllItems()
  },
  onExecute: (_item, queue) => {
    searchProcessedCount.value = queue.store.state.executionCount
  },
})

function handleInputChange(e: Event) {
  inputText.value = (e.target as HTMLInputElement).value
  queueTextChange((e.target as HTMLInputElement).value)
}

const rangeQueueItems = ref<Array<number>>([])

const rangeProcessedCount = ref(0)

const currentValue = ref(50)

const queuedValue = ref(50)

function rangeProcessQueueItem(item: number) {
  queuedValue.value = item
}

// Create the simplified queuer function
const queueValue = queue<number>(rangeProcessQueueItem, {
  key: 'Range Change Queue',
  maxSize: 100,
  wait: 100,
  onItemsChange: (queue) => {
    rangeQueueItems.value = queue.peekAllItems()
  },
  onExecute: (_item, queue) => {
    rangeProcessedCount.value = queue.store.state.executionCount
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
    <div>
      <h1>TanStack Pacer queue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Queue Size:</td>
            <td>{{ counterQueueItems.length }}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{{ counterProcessedCount }}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{{ counterQueueItems.join(', ') }}</td>
          </tr>
        </tbody>
      </table>
      <button
        @click="
          () => {
            const nextNumber = counterQueueItems.length
              ? counterQueueItems[counterQueueItems.length - 1]! + 1
              : 1
            queueItem(nextNumber)
          }
        "
        :disabled="counterQueueItems.length >= 25"
      >
        Add Number
      </button>
    </div>
    <hr />
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
            <td>{{ searchQueueItems.length }}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{{ searchProcessedCount }}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{{ searchQueueItems.join(', ') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr />
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
            <td>{{ rangeQueueItems.length }}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{{ rangeProcessedCount }}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{{ rangeQueueItems.join(', ') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
