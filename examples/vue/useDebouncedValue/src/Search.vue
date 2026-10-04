<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer/debouncer'

const instantSearch = ref('')

const [debouncedSearch] = useDebouncedValue(
  () => instantSearch.value,
  () => ({
    wait: 500,
    enabled: instantSearch.value.length > 2, // optional, defaults to true
  }),
)

function handleSearchChange(e: Event) {
  instantSearch.value = (e.target as HTMLInputElement).value
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useDebouncedValue Example 2</h1>
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
          <td>Debounced Search:</td>
          <td>{{ debouncedSearch }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
