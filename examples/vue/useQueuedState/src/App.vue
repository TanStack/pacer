<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { useQueuedState } from '@tanstack/vue-pacer/queuer'
import { ref } from 'vue'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

// Select the pending queue items as reactive state.
function processItem(item: number) {
  console.log('processing item', item)
}

const [queueItems, counterAddItem, counterQueuer] = useQueuedState(
  processItem,
  () => ({
    maxSize: 25,
    initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    started: false,
    wait: 1000, // wait 1 second between processing items - wait is optional!
  }),
  (state) => ({ items: state.items }),
)

const currentValue = ref(50)

const queuedValue = ref(50)

const submittedCount = ref(0)

const [, searchAddItem, searchQueuer] = useQueuedState(
  (item: number) => {
    queuedValue.value = item
  },
  () => ({
    maxSize: 100,
    started: true,
    wait: 100,
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  submittedCount.value = submittedCount.value + 1
  searchAddItem(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useQueuedState Example 1</h1>
      <counterQueuer.Subscribe
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
        <div>Queue Max Size: {{ 25 }}</div>
        <div>Queue Full: {{ isFull ? 'Yes' : 'No' }}</div>
        <div>Queue Peek: {{ counterQueuer.peekNextItem() }}</div>
        <div>Queue Empty: {{ isEmpty ? 'Yes' : 'No' }}</div>
        <div>Queue Idle: {{ isIdle ? 'Yes' : 'No' }}</div>
        <div>Queuer Status: {{ status }}</div>
        <div>Items Processed: {{ executionCount }}</div>
        <div>Queue Items: {{ queueItems().join(', ') }}</div>
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
                  ? queueItems()[queueItems().length - 1]! + 1
                  : 1
                counterAddItem(nextNumber)
              }
            "
            :disabled="isFull"
          >
            Add Number</button
          ><button
            :disabled="isEmpty"
            @click="
              () => {
                counterQueuer.execute()
              }
            "
          >
            Process Next</button
          ><button @click="() => counterQueuer.clear()" :disabled="isEmpty">
            Clear Queue</button
          ><button @click="() => counterQueuer.reset()" :disabled="isEmpty">
            Reset Queue</button
          ><button @click="() => counterQueuer.start()" :disabled="isRunning">
            Start Processing</button
          ><button @click="() => counterQueuer.stop()" :disabled="!isRunning">
            Stop Processing
          </button>
        </div></counterQueuer.Subscribe
      ><counterQueuer.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </counterQueuer.Subscribe>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useQueuedState Example 2</h1>
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
          <searchQueuer.Subscribe
            :selector="
              (state) => ({
                size: state.size,
                isFull: state.isFull,
                isEmpty: state.isEmpty,
                isIdle: state.isIdle,
                status: state.status,
                executionCount: state.executionCount,
              })
            "
            v-slot="{ size, isFull, isEmpty, isIdle, status, executionCount }"
            ><tr>
              <td>Queue Size:</td>
              <td>{{ size }}</td>
            </tr>
            <tr>
              <td>Queue Full:</td>
              <td>{{ isFull ? 'Yes' : 'No' }}</td>
            </tr>
            <tr>
              <td>Queue Empty:</td>
              <td>{{ isEmpty ? 'Yes' : 'No' }}</td>
            </tr>
            <tr>
              <td>Queue Idle:</td>
              <td>{{ isIdle ? 'Yes' : 'No' }}</td>
            </tr>
            <tr>
              <td>Queuer Status:</td>
              <td>{{ status }}</td>
            </tr>
            <tr>
              <td>Values Submitted:</td>
              <td>{{ submittedCount }}</td>
            </tr>
            <tr>
              <td>Items Processed:</td>
              <td>{{ executionCount }}</td>
            </tr>
            <tr>
              <td>Pending Items:</td>
              <td>{{ size }}</td>
            </tr></searchQueuer.Subscribe
          >
        </tbody>
      </table>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Queued with 100ms wait time</p>
      </div>
      <searchQueuer.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </searchQueuer.Subscribe>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
