<script setup lang="ts">
import { ref } from 'vue'
import { useQueuedValue } from '@tanstack/vue-pacer/queuer'

const currentValue = ref(50)

const submittedCount = ref(1)

const [queuedValue, queuer] = useQueuedValue(
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
    <queuer.Subscribe
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
      </div></queuer.Subscribe
    >
    <pre
      :style="{ marginTop: '20px' }"
    ><queuer.Subscribe :selector="(state) => state" v-slot="state">{{ JSON.stringify(state, null, 2) }}</queuer.Subscribe></pre>
  </div>
</template>
