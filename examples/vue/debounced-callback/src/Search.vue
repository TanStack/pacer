<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'

const searchText = ref('')

const searchTextRef = ref('')

const debouncedSearchText = ref('')

const debouncedSetSearch = useDebouncer(
  (value: typeof debouncedSearchText.value) => {
    debouncedSearchText.value = value
  },
  () => ({
    wait: 500,
    enabled: () => searchTextRef.value.length > 2,
  }),
).maybeExecute

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchTextRef.value = newValue
  searchText.value = newValue
  debouncedSetSearch(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useDebouncer Example 2</h1>
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
