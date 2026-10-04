<script lang="ts">
  import { createAsyncBatchedCallback } from '@tanstack/svelte-pacer/async-batcher'
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
  let searchQueries = $state<Array<string>>([])

  let results = $state<Array<SearchResult>>([])

  let isLoading = $state(false)

  let displayedError = $state<string | null>(null)

  let batchesProcessed = $state(0)

  const batchedSearch = createAsyncBatchedCallback(
    async (queries: Array<string>) => {
      isLoading = true
      displayedError = null
      try {
        const data = await batchedSearchApi(queries)
        results = [...results, ...data]
        batchesProcessed = batchesProcessed + 1
        return data
      } finally {
        isLoading = false
      }
    },
    () => ({
      maxSize: 3, // Process when 3 queries collected
      wait: 2000, // Or after 2 seconds
      throwOnError: false,
      onError: (error) => {
        displayedError =
          error instanceof Error ? error.message : 'Unknown error'
      },
    }),
  )

  function handleSearch(query: string) {
    if (!query.trim()) return
    searchQueries = [...searchQueries, query]
    batchedSearch(query)
  }
</script>

<div>
  <h1>TanStack Pacer createAsyncBatchedCallback Example 1</h1>
  <div style="margin-bottom: 20px">
    <button onclick={() => handleSearch('javascript')}>
      Search "javascript"</button
    ><button onclick={() => handleSearch('react')} style="margin-left: 10px">
      Search "react"</button
    ><button
      onclick={() => handleSearch('typescript')}
      style="margin-left: 10px"
    >
      Search "typescript"</button
    ><button onclick={() => handleSearch('error')} style="margin-left: 10px">
      Search "error" (will fail)
    </button>
  </div>
  {#if isLoading}<p style="color: blue">
      Processing batch search...
    </p>{/if}{#if displayedError}<p style="color: red">
      Error: {displayedError}
    </p>{/if}
  <table>
    <tbody
      ><tr><td>Total Searches Made:</td><td>{searchQueries.length}</td></tr><tr
        ><td>Results Found:</td><td>{results.length}</td></tr
      ><tr><td>Batches Processed:</td><td>{batchesProcessed}</td></tr></tbody
    >
  </table>
  <div style="margin-top: 20px">
    <h3>Search Results:</h3>
    <div
      style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
    >
      {#if results.length === 0}<p style="color: #666">
          No results yet...
        </p>{:else}{#each results as result, index (index)}<div
            style="margin-bottom: 5px; font-size: 0.9em"
          >
            <strong>{result.query}</strong>: {result.title}
          </div>{/each}{/if}
    </div>
  </div>
  <p style="font-size: 0.9em; color: #666">
    Searches are batched - max 3 queries or 2 second wait time
  </p>
</div>
