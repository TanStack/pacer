<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncDebouncer } from '@tanstack/vue-pacer/async-debouncer'
const count = ref(0)

const apiCallCount = ref(0)

// Simulate API call that returns a value
const incrementApi = async (value: number): Promise<number> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const newCount = value + 1
  apiCallCount.value = apiCallCount.value + 1
  return newCount
}

const debouncedIncrement = useAsyncDebouncer(
  async (currentValue: number) => {
    const result = await incrementApi(currentValue)
    count.value = result
    return result
  },
  () => ({
    wait: 1000,
    leading: false, // Don't execute immediately
    trailing: true, // Execute after delay
  }),
).maybeExecute

function handleIncrement() {
  // Update local state immediately for instant feedback
  const newCount = count.value + 1
  count.value = newCount
  // Debounced API call
  debouncedIncrement(newCount)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useAsyncDebouncer Example 2</h1>
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
      <button @click="handleIncrement">Increment (debounced API call)</button>
    </div>
    <p :style="{ fontSize: '0.9em', color: '#666' }">
      Click rapidly - API calls are debounced to 1 second, but UI updates
      immediately
    </p>
  </div>
</template>
