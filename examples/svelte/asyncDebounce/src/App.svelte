<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { asyncDebounce } from '@tanstack/svelte-pacer/async-debouncer'

  let searchText = $state('')

  let debouncedSearchText = $state('')

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

  const debouncedSetSearch = asyncDebounce(
    async (value: string) => {
      try {
        loading = true
        debouncedSearchText = value
        const results = await simulateSearch(value)
        searchResults = results
      } catch (err) {
        searchResults = []
      } finally {
        loading = false
      }
    },
    {
      wait: 500,
    },
  )
</script>

<div>
  <h1>TanStack Pacer asyncDebounce Example</h1>
  <div>
    <input
      type="search"
      value={searchText}
      oninput={(e) => {
        const newValue = (e.target as HTMLInputElement).value
        searchText = newValue
        debouncedSetSearch(newValue)
      }}
      placeholder="Type to search..."
      style="width: 100%"
    />{#if loading}<div>Loading...</div>{/if}
  </div>
  <table>
    <tbody
      ><tr><td>Instant Search:</td><td>{searchText}</td></tr><tr
        ><td>Debounced Search:</td><td>{debouncedSearchText}</td></tr
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
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
