<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useAsyncQueuedState } from '@tanstack/vue-pacer/async-queuer'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const fakeWaitTime = 500
type Item = number
const concurrency = ref(2)

// The function to process each item (now a number)
async function processItem(item: Item): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, fakeWaitTime))
  console.log(`Processed ${item}`)
}

const [queueItems, asyncQueuer] = useAsyncQueuedState(
  processItem,
  () => ({
    maxSize: 25,
    initialItems: Array.from({ length: 10 }, (_, i) => i + 1),
    concurrency: concurrency.value, // Process 2 items concurrently
    started: false,
    wait: 100, // for demo purposes - usually you would not want extra wait time if you are also throttling with concurrency
    onReject: (item: Item, asyncQueuer) => {
      console.log(
        'Queue is full, rejecting item',
        item,
        asyncQueuer.store.state.rejectionCount,
      )
    },
    onError: (error, item: Item, asyncQueuer) => {
      console.error(
        `Error processing item: ${item}`,
        error,
        asyncQueuer.store.state.errorCount,
      ) // optionally, handle errors here instead of your own try/catch
    },
  }),
  (state) => ({ items: state.items }),
)
</script>

<template>
  <div>
    <h1>TanStack Pacer useAsyncQueuer Example</h1>
    <asyncQueuer.Subscribe
      :selector="
        (state) => ({
          size: state.size,
          isFull: state.isFull,
          isEmpty: state.isEmpty,
          isIdle: state.isIdle,
          status: state.status,
          successCount: state.successCount,
          rejectionCount: state.rejectionCount,
          activeItems: state.activeItems,
          items: state.items,
          isRunning: state.isRunning,
        })
      "
      v-slot="{
        size,
        isFull,
        isEmpty,
        isIdle,
        status,
        successCount,
        rejectionCount,
        activeItems,
        isRunning,
      }"
      ><div></div>
      <div>Queue Size: {{ size }}</div>
      <div>Queue Max Size: {{ 25 }}</div>
      <div>Queue Full: {{ isFull ? 'Yes' : 'No' }}</div>
      <div>Queue Empty: {{ isEmpty ? 'Yes' : 'No' }}</div>
      <div>Queue Idle: {{ isIdle ? 'Yes' : 'No' }}</div>
      <div>Queuer Status: {{ status }}</div>
      <div>Items Processed: {{ successCount }}</div>
      <div>Items Rejected: {{ rejectionCount }}</div>
      <div>Active Tasks: {{ activeItems.length }}</div>
      <div>Pending Tasks: {{ queueItems().length }}</div>
      <div>
        Concurrency:{{ ' '
        }}<input
          type="number"
          :min="1"
          :value="concurrency"
          @input="
            (e) =>
              (concurrency = Math.max(
                1,
                parseInt((e.target as HTMLInputElement).value) || 1,
              ))
          "
          :style="{ width: '60px' }"
        />
      </div>
      <div :style="{ minHeight: '250px' }">
        Queue Items:<template v-for="(item, index) in queueItems()" :key="index"
          ><div>{{ index }}: {{ item }}</div></template
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
              const nextNumber = queueItems().length
                ? Math.max(...queueItems()) + 1
                : 1
              asyncQueuer.addItem(nextNumber)
            }
          "
          :disabled="isFull"
        >
          Add Async Task</button
        ><button @click="() => asyncQueuer.getNextItem()">Get Next Item</button
        ><button @click="() => asyncQueuer.clear()" :disabled="isEmpty">
          Clear Queue</button
        ><br /><button @click="() => asyncQueuer.start()" :disabled="isRunning">
          Start Processing</button
        ><button @click="() => asyncQueuer.stop()" :disabled="!isRunning">
          Stop Processing
        </button>
      </div></asyncQueuer.Subscribe
    >
    <pre
      :style="{ marginTop: '20px' }"
    ><asyncQueuer.Subscribe :selector="(state) => state" v-slot="state">{{ JSON.stringify(state, null, 2) }}</asyncQueuer.Subscribe></pre>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
