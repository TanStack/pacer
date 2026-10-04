<script setup lang="ts">
import { ref } from 'vue'
import { useThrottledValue } from '@tanstack/vue-pacer/throttler'

const instantSearch = ref('')

const [throttledSearch] = useThrottledValue(
  () => instantSearch.value,
  () => ({
    wait: 1000,
    // enabled: instantSearch.length > 2, // optional, defaults to true
  }),
)

function handleSearchChange(e: Event) {
  instantSearch.value = (e.target as HTMLInputElement).value
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useThrottledValue Example 2</h1>
    <div>
      <input
        type="search"
        :value="instantSearch"
        @input="handleSearchChange"
        placeholder="Type to search..."
        :style="{ width: '100%' }"
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
</template>
