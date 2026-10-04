<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncThrottledCallback } from '@tanstack/vue-pacer/async-throttler'
const count = ref(0)

const apiCallCount = ref(0)

// Simulate API call that returns a value
const incrementApi = async (value: number): Promise<number> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const newCount = value + 1
  apiCallCount.value = apiCallCount.value + 1
  return newCount
}

const throttledIncrement = useAsyncThrottledCallback(
  async (currentValue: number) => {
    const result = await incrementApi(currentValue)
    count.value = result
    return result
  },
  () => ({
    wait: 1000,
    leading: true, // Execute immediately on first call
    trailing: true, // Execute after throttle period ends
  }),
)

function handleIncrement() {
  // Update local state immediately for instant feedback
  count.value = ((prev) => {
    const newCount = prev + 1
    throttledIncrement(newCount)
    return newCount
  })(count.value)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useAsyncThrottledCallback Example 2</h1>
    <table>
      <tbody>
        <tr>
          <td>Current Count:</td>
          <td>{{ count }}</td>
        </tr>
        <tr>
          <td>API Calls Made:</td>
          <td>{{ apiCallCount }}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <button @click="handleIncrement">Increment (throttled API call)</button>
    </div>
    <p :style="{ fontSize: '0.9em', color: '#666' }">
      Click rapidly - API calls are throttled to 1 second, but UI updates
      immediately. First click executes immediately, then at most once per
      second.
    </p>
  </div>
</template>
