<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useQueuedValue } from '@tanstack/vue-pacer/queuer'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantSearchValue = ref('')

const [value, counterQueuer] = useQueuedValue(
  () => instantSearchValue.value,
  () => ({
    maxSize: 25,
    wait: 500, // wait 500ms between processing value changes
  }),
)

const currentValue = ref(50)

const submittedCount = ref(1)

const [queuedValue, searchQueuer] = useQueuedValue(
  () => currentValue.value,
  () => ({
    maxSize: 100,
    wait: 100,
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  submittedCount.value = submittedCount.value + 1
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useQueuedValue Example 1</h1>
      <div>Current Value: {{ value }}</div>
      <hr />
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
        <div>Queue Full: {{ isFull ? 'Yes' : 'No' }}</div>
        <div>Queue Peek: {{ counterQueuer.peekNextItem() }}</div>
        <div>Queue Empty: {{ isEmpty ? 'Yes' : 'No' }}</div>
        <div>Queue Idle: {{ isIdle ? 'Yes' : 'No' }}</div>
        <div>Queuer Status: {{ status }}</div>
        <div>Items Processed: {{ executionCount }}</div>
        <div>Queue Items: {{ counterQueuer.peekAllItems().join(', ') }}</div>
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
      >
      <pre
        :style="{ marginTop: '20px' }"
      ><counterQueuer.Subscribe :selector="(state) => state" v-slot="state">{{ JSON.stringify(state, null, 2) }}</counterQueuer.Subscribe></pre>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useQueuedValue Example 2</h1>
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
        ><table>
          <tbody>
            <tr>
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
            </tr>
          </tbody>
        </table>
        <div :style="{ color: '#666', fontSize: '0.9em' }">
          <p>Queued with 100ms wait time</p>
        </div></searchQueuer.Subscribe
      >
      <pre
        :style="{ marginTop: '20px' }"
      ><searchQueuer.Subscribe :selector="(state) => state" v-slot="state">{{ JSON.stringify(state, null, 2) }}</searchQueuer.Subscribe></pre>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
