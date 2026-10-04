<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncBatcher } from '@tanstack/vue-pacer/async-batcher'
interface SearchResult {
  id: number
  title: string
  query: string
}
// Simulate batched API search call
const batchedSearchApi = async (
  queries: Array<string>,
): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay
  if (queries.some((q) => q === 'error')) {
    throw new Error('Simulated batch API error')
  }
  return queries.flatMap((query, index) => [
    { id: index * 10 + 1, title: `${query} result 1`, query },
    { id: index * 10 + 2, title: `${query} result 2`, query },
  ])
}
const searchQueries = ref<Array<string>>([])

const results = ref<Array<SearchResult>>([])

const isLoading = ref(false)

const displayedError = ref<string | null>(null)

const batchesProcessed = ref(0)

const batchedSearch = useAsyncBatcher(
  async (queries: Array<string>) => {
    isLoading.value = true
    displayedError.value = null
    try {
      const data = await batchedSearchApi(queries)
      results.value = [...results.value, ...data]
      batchesProcessed.value = batchesProcessed.value + 1
      return data
    } finally {
      isLoading.value = false
    }
  },
  () => ({
    maxSize: 3, // Process when 3 queries collected
    wait: 2000, // Or after 2 seconds
    throwOnError: false,
    onError: (error) => {
      displayedError.value =
        error instanceof Error ? error.message : 'Unknown error'
    },
  }),
).addItem

function handleSearch(query: string) {
  if (!query.trim()) return
  searchQueries.value = [...searchQueries.value, query]
  batchedSearch(query)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useAsyncBatcher Example 1</h1>
    <div :style="{ marginBottom: '20px' }">
      <button @click="() => handleSearch('javascript')">
        Search "javascript"</button
      ><button
        @click="() => handleSearch('react')"
        :style="{ marginLeft: '10px' }"
      >
        Search "react"</button
      ><button
        @click="() => handleSearch('typescript')"
        :style="{ marginLeft: '10px' }"
      >
        Search "typescript"</button
      ><button
        @click="() => handleSearch('error')"
        :style="{ marginLeft: '10px' }"
      >
        Search "error" (will fail)
      </button>
    </div>
    <template v-if="isLoading"
      ><p :style="{ color: 'blue' }">Processing batch search...</p></template
    ><template v-if="displayedError"
      ><p :style="{ color: 'red' }">Error: {{ displayedError }}</p></template
    >
    <table>
      <tbody>
        <tr>
          <td>Total Searches Made:</td>
          <td>{{ searchQueries.length }}</td>
        </tr>
        <tr>
          <td>Results Found:</td>
          <td>{{ results.length }}</td>
        </tr>
        <tr>
          <td>Batches Processed:</td>
          <td>{{ batchesProcessed }}</td>
        </tr>
      </tbody>
    </table>
    <div :style="{ marginTop: '20px' }">
      <h3>Search Results:</h3>
      <div
        :style="{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
        }"
      >
        <template v-if="results.length === 0"
          ><p :style="{ color: '#666' }">No results yet...</p></template
        ><template v-else
          ><template v-for="(result, index) in results" :key="index"
            ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
              <strong>{{ result.query }}</strong
              >: {{ result.title }}
            </div></template
          ></template
        >
      </div>
    </div>
    <p :style="{ fontSize: '0.9em', color: '#666' }">
      Searches are batched - max 3 queries or 2 second wait time
    </p>
  </div>
</template>
