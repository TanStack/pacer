<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from '@tanstack/vue-pacer/debouncer'

const instantCount = ref(0)

const debouncedCount = ref(0)

// Create debounced setter function - Stable reference required!
const debouncedSetCount = debounce(
  (value: typeof debouncedCount.value) => (debouncedCount.value = value),
  {
    wait: 500,
    // leading: true, // optional, defaults to false
  },
)

function increment() {
  // this pattern helps avoid common bugs with stale closures and state
  instantCount.value = ((c) => {
    const newInstantCount = c + 1 // common new value for both
    debouncedSetCount(newInstantCount) // debounced state update
    return newInstantCount // instant state update
  })(instantCount.value)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer debounce Example 1</h1>
    <table>
      <tbody>
        <tr>
          <td>Instant Count:</td>
          <td>{{ instantCount }}</td>
        </tr>
        <tr>
          <td>Debounced Count:</td>
          <td>{{ debouncedCount }}</td>
        </tr>
      </tbody>
    </table>
    <div><button @click="increment">Increment</button></div>
  </div>
</template>
