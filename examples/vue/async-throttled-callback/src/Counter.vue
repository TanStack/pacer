<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncThrottler } from '@tanstack/vue-pacer/async-throttler'
interface SearchResult {
  id: number
  title: string
}
// Simulate API call with fake data
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
  if (term === 'error') {
    throw new Error('Simulated API error')
  }
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}
const searchTerm = ref('')

const results = ref<Array<SearchResult>>([])

const isLoading = ref(false)

const error = ref<string | null>(null)

const throttledSearch = useAsyncThrottler(
  async (term: string) => {
    if (!term.trim()) {
      results.value = []
      return []
    }
    isLoading.value = true
    error.value = null
    try {
      const data = await fakeApi(term)
      results.value = data
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = errorMessage
      results.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  },
  () => ({
    wait: 1000,
    // leading: true, // optional, defaults to true
    // trailing: true, // optional, defaults to true
  }),
).maybeExecute

async function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchTerm.value = newValue
  try {
    await throttledSearch(newValue)
  } catch (err) {
    // Error is already handled in the throttled function
    console.log('Search failed:', err)
  }
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useAsyncThrottler Example 1</h1>
    <div>
      <input
        type="search"
        :value="searchTerm"
        @input="handleSearchChange"
        placeholder="Type to search... (try 'error' to see error handling)"
        :style="{ width: '100%', marginBottom: '10px' }"
      />
    </div>
    <template v-if="isLoading"
      ><p :style="{ color: 'blue' }">Searching...</p></template
    ><template v-if="error"
      ><p :style="{ color: 'red' }">Error: {{ error }}</p></template
    >
    <div>
      <p>Current search term: {{ searchTerm }}</p>
      <template v-if="results.length > 0"
        ><div>
          <h3>Results:</h3>
          <ul>
            <template v-for="(result, index) in results" :key="index"
              ><li>{{ result.title }}</li></template
            >
          </ul>
        </div></template
      >
    </div>
  </div>
</template>
