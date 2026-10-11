<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { useQueuer } from '@tanstack/vue-pacer/queuer'
import { ref } from 'vue'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

// The function that we will be queuing
function counterProcessItem(item: number) {
  console.log('processing item', item)
}

const counterQueuer = useQueuer(counterProcessItem, () => ({
  key: 'Add Number Queue',
  initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  maxSize: 25, // optional, defaults to Infinity
  started: false, // optional, defaults to true
  wait: 1000, // wait 1 second between processing items - wait is optional!
}))

const currentValue = ref(50)

const queuedValue = ref(50)

const submittedCount = ref(1)

function rangeProcessItem(item: number) {
  queuedValue.value = item
}

const rangeQueuer = useQueuer(rangeProcessItem, () => ({
  key: 'Range Queue',
  maxSize: 100,
  initialItems: [currentValue.value],
  wait: 100,
}))

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  submittedCount.value = submittedCount.value + 1
  rangeQueuer.addItem(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useQueuer Example 1</h1>
      <counterQueuer.Subscribe
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
        <div>Queue Peek: {{ counterQueuer.peekNextItem() }}</div>
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
                const nextNumber = items.length
                  ? items[items.length - 1]! + 1
                  : 1
                counterQueuer.addItem(nextNumber)
              }
            "
            :disabled="isFull"
          >
            Add Number</button
          ><button
            :disabled="isEmpty"
            @click="
              () => {
                const item = counterQueuer.execute()
                console.log('getNextItem item', item)
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
            Stop Processing</button
          ><button @click="() => counterQueuer.flush()" :disabled="isEmpty">
            Flush Queue
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
      <h1>TanStack Pacer useQueuer Example 2</h1>
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
          <rangeQueuer.Subscribe
            :selector="
              (state) => ({
                size: state.size,
                isFull: state.isFull,
                isEmpty: state.isEmpty,
                isIdle: state.isIdle,
                isRunning: state.isRunning,
                executionCount: state.executionCount,
              })
            "
            v-slot="{
              size,
              isFull,
              isEmpty,
              isIdle,
              isRunning,
              executionCount,
            }"
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
              <td>{{ isRunning ? 'Running' : 'Stopped' }}</td>
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
            </tr></rangeQueuer.Subscribe
          >
        </tbody>
      </table>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Queued with 100ms wait time</p>
      </div>
      <div><button @click="() => rangeQueuer.flush()">Flush Queue</button></div>
      <rangeQueuer.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </rangeQueuer.Subscribe>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
