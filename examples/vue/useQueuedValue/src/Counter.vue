<script setup lang="ts">
import { ref } from 'vue'
import { useQueuedValue } from '@tanstack/vue-pacer/queuer'

const instantSearchValue = ref('')

const [value, queuer] = useQueuedValue(
  () => instantSearchValue.value,
  () => ({
    maxSize: 25,
    wait: 500, // wait 500ms between processing value changes
  }),
)
</script>
<template>
  <div>
    <h1>TanStack Pacer useQueuedValue Example 1</h1>
    <div>Current Value: {{ value }}</div>
    <hr />
    <queuer.Subscribe
      :selector="
        (state) => ({
          size: state.size,
          isFull: state.isFull,
          isEmpty: state.isEmpty,
          isIdle: state.isIdle,
          status: state.status,
          executionCount: state.executionCount,
          isRunning: state.isRunning,
        })
      "
      v-slot="{
        size,
        isFull,
        isEmpty,
        isIdle,
        status,
        executionCount,
        isRunning,
      }"
      ><div>Queue Size: {{ size }}</div>
      <div>Queue Full: {{ isFull ? 'Yes' : 'No' }}</div>
      <div>Queue Peek: {{ queuer.peekNextItem() }}</div>
      <div>Queue Empty: {{ isEmpty ? 'Yes' : 'No' }}</div>
      <div>Queue Idle: {{ isIdle ? 'Yes' : 'No' }}</div>
      <div>Queuer Status: {{ status }}</div>
      <div>Items Processed: {{ executionCount }}</div>
      <div>Queue Items: {{ queuer.peekAllItems().join(', ') }}</div>
      <div
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          maxWidth: '600px',
          margin: '16px 0',
        }"
      >
        <input
          type="search"
          :value="instantSearchValue"
          @input="
            (e) => {
              instantSearchValue = (e.target as HTMLInputElement).value // instantly update the local search value
            }
          "
          placeholder="Enter search term..."
          :disabled="isFull"
        /><button
          :disabled="isEmpty"
          @click="
            () => {
              queuer.execute()
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
          Stop Processing
        </button>
      </div></queuer.Subscribe
    >
    <pre
      :style="{ marginTop: '20px' }"
    ><queuer.Subscribe :selector="(state) => state" v-slot="state">{{ JSON.stringify(state, null, 2) }}</queuer.Subscribe></pre>
  </div>
</template>
