<script lang="ts">
  import { asyncThrottle } from '@tanstack/svelte-pacer/async-throttler'

  let searchText = $state('')

  let throttledSearchText = $state('')

  let searchResults = $state<Array<string>>([])

  let loading = $state(false)

  // Simulate search API
  const simulateSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return [
      `Result 1 for ${query}`,
      `Result 2 for ${query}`,
      `Result 3 for ${query}`,
    ]
  }

  const throttledSetSearch = asyncThrottle(
    async (value: string) => {
      try {
        loading = true
        throttledSearchText = value
        const results = await simulateSearch(value)
        searchResults = results
      } catch (err) {
        searchResults = []
      } finally {
        loading = false
      }
    },
    {
      wait: 1000,
    },
  )
</script>

<div>
  <h1>TanStack Pacer asyncThrottle Example</h1>
  <div>
    <input
      type="search"
      value={searchText}
      oninput={(e) => {
        const newValue = (e.target as HTMLInputElement).value
        searchText = newValue
        throttledSetSearch(newValue)
      }}
      placeholder="Type to search..."
      style="width: 100%"
    />{#if loading}<div>Loading...</div>{/if}
  </div>
  <table>
    <tbody
      ><tr><td>Instant Search:</td><td>{searchText}</td></tr><tr
        ><td>Throttled Search:</td><td>{throttledSearchText}</td></tr
      ></tbody
    >
  </table>
  <div>
    <h3>Search Results:</h3>
    <ul>
      {#each searchResults as result, i (i)}<li>{result}</li>{/each}
    </ul>
  </div>
</div>
