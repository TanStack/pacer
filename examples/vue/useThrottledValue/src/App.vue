<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThrottledValue } from '@tanstack/vue-pacer/throttler'

// Example 1: Counter
const instantCount = ref(0)
const [throttledCount] = useThrottledValue(instantCount, { wait: 500 })

function increment() {
  instantCount.value++
}

// Example 2: Search input with leading/trailing options
const instantSearch = ref('')
const [throttledSearch] = useThrottledValue(instantSearch, {
  wait: 500,
  leading: true,
  trailing: true,
})

// Example 3: Range slider with throttler state
const currentValue = ref(50)
const instantExecutionCount = ref(0)

const [throttledValue, throttler] = useThrottledValue(currentValue, {
  wait: 250,
})

const throttlerState = throttler.state

const savedExecutions = computed(
  () => instantExecutionCount.value - throttlerState.value.executionCount,
)

const reductionPercent = computed(() =>
  instantExecutionCount.value === 0
    ? 0
    : Math.round((savedExecutions.value / instantExecutionCount.value) * 100),
)

function handleRangeChange(e: Event) {
  const target = e.target as HTMLInputElement
  currentValue.value = parseInt(target.value, 10)
  instantExecutionCount.value++
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useThrottledValue Example 1</h1>
    <table>
      <tbody>
        <tr>
          <td>Instant Count:</td>
          <td>{{ instantCount }}</td>
        </tr>
        <tr>
          <td>Throttled Count:</td>
          <td>{{ throttledCount }}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <button @click="increment">Increment</button>
    </div>
  </div>

  <hr />

  <div>
    <h1>TanStack Pacer useThrottledValue Example 2</h1>
    <div>
      <input
        v-model="instantSearch"
        autofocus
        type="search"
        placeholder="Type to search..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody>
        <tr>
          <td>Instant Search:</td>
          <td>{{ instantSearch }}</td>
        </tr>
        <tr>
          <td>Throttled Search:</td>
          <td>{{ throttledSearch }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <hr />

  <div>
    <h1>TanStack Pacer useThrottledValue Example 3</h1>
    <div style="margin-bottom: 20px">
      <label>
        Current Range:
        <input
          type="range"
          min="0"
          max="100"
          :value="currentValue"
          @input="handleRangeChange"
          style="width: 100%"
        />
        <span>{{ currentValue }}</span>
      </label>
    </div>
    <div style="margin-bottom: 20px">
      <label>
        Throttled Range (Readonly):
        <input
          type="range"
          min="0"
          max="100"
          :value="throttledValue"
          readonly
          style="width: 100%"
        />
        <span>{{ throttledValue }}</span>
      </label>
    </div>
    <table>
      <tbody>
        <tr>
          <td>Is Pending:</td>
          <td>{{ throttlerState.isPending }}</td>
        </tr>
        <tr>
          <td>Instant Executions:</td>
          <td>{{ instantExecutionCount }}</td>
        </tr>
        <tr>
          <td>Throttled Executions:</td>
          <td>{{ throttlerState.executionCount }}</td>
        </tr>
        <tr>
          <td>Saved Executions:</td>
          <td>{{ savedExecutions }}</td>
        </tr>
        <tr>
          <td>% Reduction:</td>
          <td>{{ reductionPercent }}%</td>
        </tr>
      </tbody>
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Throttled to 250ms wait time</p>
    </div>
    <pre style="margin-top: 20px">{{
      JSON.stringify(throttlerState, null, 2)
    }}</pre>
  </div>
</template>
