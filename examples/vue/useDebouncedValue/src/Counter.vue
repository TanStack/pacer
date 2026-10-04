<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer/debouncer'

const instantCount = ref(0)

function increment() {
  instantCount.value = instantCount.value + 1
}

const [debouncedCount] = useDebouncedValue(
  () => instantCount.value,
  () => ({
    wait: 500,
    // enabled: () => instantCount > 2, // optional, defaults to true
    // leading: true, // optional, defaults to false
  }),
)
</script>
<template>
  <div>
    <h1>TanStack Pacer useDebouncedValue Example 1</h1>
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
