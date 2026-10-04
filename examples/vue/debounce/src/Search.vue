<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from '@tanstack/vue-pacer/debouncer'

const searchText = ref('')

const debouncedSearchText = ref('')

// Create debounced setter function - Stable reference required!
const debouncedSetSearch = debounce(
  (value: typeof debouncedSearchText.value) =>
    (debouncedSearchText.value = value),
  {
    wait: 500,
  },
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchText.value = newValue
  debouncedSetSearch(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer debounce Example 2</h1>
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
          <td>Debounced Search:</td>
          <td>{{ debouncedSearchText }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
