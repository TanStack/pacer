<script setup lang="ts">
import { ref } from 'vue'
import { useThrottler } from '@tanstack/vue-pacer/throttler'

const instantCount = ref(0)

const instantCountRef = ref(0)

const throttledCount = ref(0)

const throttledSetCount = useThrottler(
  (value: typeof throttledCount.value) => {
    throttledCount.value = value
  },
  () => ({
    wait: 1000,
    enabled: () => instantCountRef.value > 2,
  }),
).maybeExecute

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  throttledSetCount(nextCount)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useThrottler Example 1</h1>
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
