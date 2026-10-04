<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'

const instantCount = ref(0)

const instantCountRef = ref(0)

const debouncedCount = ref(0)

const debouncedSetCount = useDebouncer(
  (value: typeof debouncedCount.value) => {
    debouncedCount.value = value
  },
  () => ({
    wait: 500,
    // enabled: () => instantCountRef.value > 2, // optional, defaults to true
    // leading: true, // optional, defaults to false
  }),
).maybeExecute

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  debouncedSetCount(nextCount)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useDebouncer Example 1</h1>
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
