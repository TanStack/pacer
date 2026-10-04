<script setup lang="ts">
import { ref } from 'vue'
import { asyncDebounce } from '@tanstack/vue-pacer/async-debouncer'

const searchText = ref('')

const debouncedSearchText = ref('')

const searchResults = ref<Array<string>>([])

const loading = ref(false)

// Simulate search API
const simulateSearch = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return [
    `Result 1 for ${query}`,
    `Result 2 for ${query}`,
    `Result 3 for ${query}`,
  ]
}

const debouncedSetSearch = asyncDebounce(
  async (value: string) => {
    try {
      loading.value = true
      debouncedSearchText.value = value
      const results = await simulateSearch(value)
      searchResults.value = results
    } catch (err) {
      searchResults.value = []
    } finally {
      loading.value = false
    }
  },
  {
    wait: 500,
  },
)
</script>
<template>
  <div>
    <h1>TanStack Pacer asyncDebounce Example</h1>
    <div>
      <input
        type="search"
        :value="searchText"
        @input="
          (e) => {
            const newValue = (e.target as HTMLInputElement).value
            searchText = newValue
            debouncedSetSearch(newValue)
          }
        "
        placeholder="Type to search..."
        :style="{ width: '100%' }"
      /><template v-if="loading"><div>Loading...</div></template>
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
    <div>
      <h3>Search Results:</h3>
      <ul>
        <template v-for="(result, i) in searchResults" :key="i"
          ><li>{{ result }}</li></template
        >
      </ul>
    </div>
  </div>
</template>
