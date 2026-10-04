<script setup lang="ts">
import { ref } from 'vue'
import { useThrottledCallback } from '@tanstack/vue-pacer/throttler'

const searchText = ref('')

const searchTextRef = ref('')

const throttledSearchText = ref('')

const throttledSetSearch = useThrottledCallback(
  (value: typeof throttledSearchText.value) => {
    throttledSearchText.value = value
  },
  () => ({
    wait: 1000,
    enabled: () => searchTextRef.value.length > 2,
  }),
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchTextRef.value = newValue
  searchText.value = newValue
  throttledSetSearch(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useThrottledCallback Example 2</h1>
    <div>
      <input
        type="search"
        :value="searchText"
        @input="handleSearchChange"
        placeholder="Type to search..."
        :style="{ width: '100%' }"
      />
    </div>
    <table>
      <tbody>
        <tr>
          <td>Instant Search:</td>
          <td>{{ searchText }}</td>
        </tr>
        <tr>
          <td>Throttled Search:</td>
          <td>{{ throttledSearchText }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
