<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncDebouncer } from '@tanstack/vue-pacer/async-debouncer'

interface SearchResult {
  id: number
  title: string
}

const searchText = ref('')
const results = ref<Array<SearchResult>>([])
const error = ref<string | null>(null)

// Simulated API search function
async function searchAPI(query: string): Promise<Array<SearchResult>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simulate occasional errors
  if (query.toLowerCase() === 'error') {
    throw new Error('Search failed: API error')
  }

  // Return mock results
  if (!query.trim()) return []

  return [
    { id: 1, title: `Result for "${query}" - Item 1` },
    { id: 2, title: `Result for "${query}" - Item 2` },
    { id: 3, title: `Result for "${query}" - Item 3` },
  ]
}

const searchDebouncer = useAsyncDebouncer(
  async (query: string) => {
    error.value = null
    const searchResults = await searchAPI(query)
    results.value = searchResults
    return searchResults
  },
  {
    wait: 500,
    onError: (err) => {
      error.value = err.message
      results.value = []
    },
  },
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchText.value = newValue
  searchDebouncer.maybeExecute(newValue)
}

function handleClear() {
  searchText.value = ''
  results.value = []
  error.value = null
  searchDebouncer.cancel()
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useAsyncDebouncer Example</h1>
    <p>
      This example demonstrates debounced async API search. The search only
      executes after you stop typing for 500ms, and tracks execution state.
    </p>

    <div style="margin-bottom: 1rem">
      <input
        autofocus
        type="search"
        :value="searchText"
        @input="handleSearchChange"
        placeholder="Type to search... (try 'error' to simulate API error)"
        style="width: 100%; padding: 0.5rem; font-size: 1rem"
      />
    </div>

    <div style="margin-bottom: 1rem">
      <button @click="searchDebouncer.flush()">Flush (Search Now)</button>
      <button @click="searchDebouncer.cancel()" style="margin-left: 0.5rem">
        Cancel Pending
      </button>
      <button @click="searchDebouncer.abort()" style="margin-left: 0.5rem">
        Abort In-Flight
      </button>
      <button @click="handleClear" style="margin-left: 0.5rem">Clear</button>
    </div>

    <searchDebouncer.Subscribe
      :selector="
        (state) => ({
          status: state.status,
          isPending: state.isPending,
          isExecuting: state.isExecuting,
          successCount: state.successCount,
          errorCount: state.errorCount,
          settleCount: state.settleCount,
          maybeExecuteCount: state.maybeExecuteCount,
        })
      "
      v-slot="{
        status,
        isPending,
        isExecuting,
        successCount,
        errorCount,
        settleCount,
        maybeExecuteCount,
      }"
    >
      <table>
        <tbody>
          <tr>
            <td>Status:</td>
            <td>
              <strong>{{ status }}</strong>
            </td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{{ isPending }}</td>
          </tr>
          <tr>
            <td>Is Executing:</td>
            <td>{{ isExecuting }}</td>
          </tr>
          <tr>
            <td colspan="2">
              <hr />
            </td>
          </tr>
          <tr>
            <td>Maybe Execute Count:</td>
            <td>{{ maybeExecuteCount }}</td>
          </tr>
          <tr>
            <td>Success Count:</td>
            <td>{{ successCount }}</td>
          </tr>
          <tr>
            <td>Error Count:</td>
            <td>{{ errorCount }}</td>
          </tr>
          <tr>
            <td>Settle Count:</td>
            <td>{{ settleCount }}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{{ maybeExecuteCount - settleCount }}</td>
          </tr>
        </tbody>
      </table>
    </searchDebouncer.Subscribe>

    <div v-if="error" style="color: red; margin-top: 1rem">
      {{ error }}
    </div>

    <div v-if="results.length > 0" style="margin-top: 1rem">
      <h3>Results:</h3>
      <ul>
        <li v-for="result in results" :key="result.id">
          {{ result.title }}
        </li>
      </ul>
    </div>

    <searchDebouncer.Subscribe :selector="(state) => state" v-slot="state">
      <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
    </searchDebouncer.Subscribe>
  </div>
</template>
