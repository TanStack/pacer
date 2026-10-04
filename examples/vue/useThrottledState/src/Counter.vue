<script setup lang="ts">
import { ref } from 'vue'
import { useThrottledState } from '@tanstack/vue-pacer/throttler'

const instantCount = ref(0)

const instantCountRef = ref(0)

const [throttledCount, setThrottledCount, throttler] = useThrottledState(
  instantCount.value,
  () => ({
    wait: 1000,
    // enabled: () => instantCountRef.value > 2, // optional, defaults to true
  }),
)

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  setThrottledCount(nextCount)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useThrottledState Example 1</h1>
    <table>
      <tbody>
        <throttler.Subscribe
          :selector="(state) => ({ executionCount: state.executionCount })"
          v-slot="{ executionCount }"
          ><tr>
            <td>Execution Count:</td>
            <td>{{ executionCount }}</td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>{{ instantCount }}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>{{ throttledCount }}</td>
          </tr></throttler.Subscribe
        >
      </tbody>
    </table>
    <div><button @click="increment">Increment</button></div>
    <throttler.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </throttler.Subscribe>
  </div>
</template>
