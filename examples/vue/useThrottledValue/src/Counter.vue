<script setup lang="ts">
import { ref } from 'vue'
import { useThrottledValue } from '@tanstack/vue-pacer/throttler'

const instantCount = ref(0)

function increment() {
  instantCount.value = instantCount.value + 1
}

const [throttledCount] = useThrottledValue(
  () => instantCount.value,
  () => ({
    wait: 1000,
    // enabled: () => instantCount > 2, // optional, defaults to true
  }),
)
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
    <div><button @click="increment">Increment</button></div>
  </div>
</template>
