<script setup lang="ts">
import { useQueuer } from '@tanstack/vue-pacer/queuer'

// The function that we will be queuing
function processItem(item: number) {
  console.log('processing item', item)
}

const queuer = useQueuer(processItem, () => ({
  key: 'Add Number Queue',
  initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  maxSize: 25, // optional, defaults to Infinity
  started: false, // optional, defaults to true
  wait: 1000, // wait 1 second between processing items - wait is optional!
}))
</script>
<template>
  <div>
    <h1>TanStack Pacer useQueuer Example 1</h1>
    <queuer.Subscribe
      :selector="
        (state) => ({
          size: state.size,
          isFull: state.isFull,
          isEmpty: state.isEmpty,
          isIdle: state.isIdle,
          isRunning: state.isRunning,
          status: state.status,
          executionCount: state.executionCount,
          items: state.items,
        })
      "
      v-slot="{
        size,
        isFull,
        isEmpty,
        isIdle,
        isRunning,
        status,
        executionCount,
        items,
      }"
      ><div>Queue Size: {{ size }}</div>
      <div>Queue Max Size: {{ 25 }}</div>
      <div>Queue Full: {{ isFull ? 'Yes' : 'No' }}</div>
      <div>Queue Peek: {{ queuer.peekNextItem() }}</div>
      <div>Queue Empty: {{ isEmpty ? 'Yes' : 'No' }}</div>
      <div>Queue Idle: {{ isIdle ? 'Yes' : 'No' }}</div>
      <div>Queuer Status: {{ status }}</div>
      <div>Items Processed: {{ executionCount }}</div>
      <div>Queue Items: {{ items.join(', ') }}</div>
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
              const nextNumber = items.length ? items[items.length - 1]! + 1 : 1
              queuer.addItem(nextNumber)
            }
          "
          :disabled="isFull"
        >
          Add Number</button
        ><button
          :disabled="isEmpty"
          @click="
            () => {
              const item = queuer.execute()
              console.log('getNextItem item', item)
            }
          "
        >
          Process Next</button
        ><button @click="() => queuer.clear()" :disabled="isEmpty">
          Clear Queue</button
        ><button @click="() => queuer.reset()" :disabled="isEmpty">
          Reset Queue</button
        ><button @click="() => queuer.start()" :disabled="isRunning">
          Start Processing</button
        ><button @click="() => queuer.stop()" :disabled="!isRunning">
          Stop Processing</button
        ><button @click="() => queuer.flush()" :disabled="isEmpty">
          Flush Queue
        </button>
      </div></queuer.Subscribe
    ><queuer.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </queuer.Subscribe>
  </div>
</template>
