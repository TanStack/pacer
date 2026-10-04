<script lang="ts">
  import { createAsyncDebouncedCallback } from '@tanstack/svelte-pacer/async-debouncer'
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
  let searchTerm = $state('')

  let results = $state<Array<SearchResult>>([])

  let isLoading = $state(false)

  let error = $state<string | null>(null)

  const debouncedSearch = createAsyncDebouncedCallback(
    async (term: string) => {
      if (!term.trim()) {
        results = []
        return []
      }
      isLoading = true
      error = null
      try {
        const data = await fakeApi(term)
        results = data
        return data
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        error = errorMessage
        results = []
        throw err
      } finally {
        isLoading = false
      }
    },
    () => ({
      wait: 500,
      // leading: true, // optional, defaults to false
      // trailing: true, // optional, defaults to true
    }),
  )

  async function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchTerm = newValue
    try {
      await debouncedSearch(newValue)
    } catch (err) {
      // Error is already handled in the debounced function
      console.log('Search failed:', err)
    }
  }
</script>

<div>
  <h1>TanStack Pacer createAsyncDebouncedCallback Example 1</h1>
  <div>
    <input
      type="search"
      value={searchTerm}
      oninput={handleSearchChange}
      placeholder="Type to search... (try 'error' to see error handling)"
      style="width: 100%; margin-bottom: 10px"
    />
  </div>
  {#if isLoading}<p style="color: blue">Searching...</p>{/if}{#if error}<p
      style="color: red"
    >
      Error: {error}
    </p>{/if}
  <div>
    <p>Current search term: {searchTerm}</p>
    {#if results.length > 0}<div>
        <h3>Results:</h3>
        <ul>
          {#each results as result, index (index)}<li>{result.title}</li>{/each}
        </ul>
      </div>{/if}
  </div>
</div>
