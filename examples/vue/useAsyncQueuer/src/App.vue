<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useAsyncQueuer } from '@tanstack/vue-pacer/async-queuer'

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

const asyncQueuer = useAsyncQueuer(processItem, () => ({
  key: 'useAsyncQueuer',
  maxSize: 25,
  initialItems: Array.from({ length: 10 }, (_, i) => i + 1),
  concurrency: concurrency.value, // Process 2 items concurrently
  started: false,
  wait: 100, // for demo purposes - usually you would not want extra wait time if you are also throttling with concurrency
  onReject: (item, asyncQueuer) => {
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
}))
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
        items,
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
      <div>Pending Tasks: {{ items.length }}</div>
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
        Queue Items:<template
          v-for="(item, index) in asyncQueuer.peekAllItems()"
          :key="index"
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
              const nextNumber = asyncQueuer.peekAllItems().length
                ? Math.max(...asyncQueuer.peekAllItems()) + 1
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
        ><button @click="() => asyncQueuer.flush()" :disabled="isEmpty">
          Flush Queue</button
        ><button @click="() => asyncQueuer.start()" :disabled="isRunning">
          Start Processing</button
        ><button @click="() => asyncQueuer.stop()" :disabled="!isRunning">
          Stop Processing</button
        ><button @click="() => asyncQueuer.reset()">Reset Queue</button>
      </div></asyncQueuer.Subscribe
    ><asyncQueuer.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </asyncQueuer.Subscribe>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
