<script setup lang="ts">
import { ref } from 'vue'
import { throttle } from '@tanstack/vue-pacer/throttler'

const instantCount = ref(0)

const throttledCount = ref(0)

// Create throttled setter function - Stable reference required!
const throttledSetCount = throttle(
  (value: typeof throttledCount.value) => (throttledCount.value = value),
  {
    wait: 1000,
  },
)

function increment() {
  // this pattern helps avoid common bugs with stale closures and state
  instantCount.value = ((c) => {
    const newInstantCount = c + 1 // common new value for both
    throttledSetCount(newInstantCount) // throttled state update
    return newInstantCount // instant state update
  })(instantCount.value)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer throttle Example 1</h1>
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
    <div><button @click="increment">Increment</button></div>
  </div>
</template>
