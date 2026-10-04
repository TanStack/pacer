<script setup lang="ts">
import { ref } from 'vue'
import { useQueuer } from '@tanstack/vue-pacer/queuer'

const currentValue = ref(50)

const queuedValue = ref(50)

const submittedCount = ref(1)

function processItem(item: number) {
  queuedValue.value = item
}

const queuer = useQueuer(processItem, () => ({
  key: 'Range Queue',
  maxSize: 100,
  initialItems: [currentValue.value],
  wait: 100,
}))

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  submittedCount.value = submittedCount.value + 1
  queuer.addItem(newValue)
}
</script>
<template>
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
        <queuer.Subscribe
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
          v-slot="{ size, isFull, isEmpty, isIdle, isRunning, executionCount }"
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
          </tr></queuer.Subscribe
        >
      </tbody>
    </table>
    <div :style="{ color: '#666', fontSize: '0.9em' }">
      <p>Queued with 100ms wait time</p>
    </div>
    <div><button @click="() => queuer.flush()">Flush Queue</button></div>
    <queuer.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </queuer.Subscribe>
  </div>
</template>
