<script lang="ts">
  import { asyncRateLimit } from '@tanstack/svelte-pacer/async-rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let searchText = $state('')

  let rateLimitedSearchText = $state('')

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

  const rateLimitedSetSearch = $derived.by(() =>
    asyncRateLimit(
      async (value: string) => {
        try {
          loading = true
          rateLimitedSearchText = value
          const results = await simulateSearch(value)
          searchResults = results
        } catch (err) {
          searchResults = []
        } finally {
          loading = false
        }
      },
      {
        limit: 5,
        window: 5000,
        windowType: windowType,
        onReject: (_args, rateLimiter) => {
          console.log(
            `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
          )
        },
      },
    ),
  )
</script>

<div>
  <h1>TanStack Pacer asyncRateLimit Example</h1>
  <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
    <label
      ><input
        type="radio"
        name="windowType"
        value="fixed"
        checked={windowType === 'fixed'}
        oninput={() => (windowType = 'fixed')}
      />Fixed Window</label
    ><label
      ><input
        type="radio"
        name="windowType"
        value="sliding"
        checked={windowType === 'sliding'}
        oninput={() => (windowType = 'sliding')}
      />Sliding Window</label
    >
  </div>
  <div>
    <input
      type="search"
      value={searchText}
      oninput={(e) => {
        const newValue = (e.target as HTMLInputElement).value
        searchText = newValue
        rateLimitedSetSearch(newValue)
      }}
      placeholder="Type to search..."
      style="width: 100%"
    />{#if loading}<div>Loading...</div>{/if}
  </div>
  <table>
    <tbody
      ><tr><td>Instant Search:</td><td>{searchText}</td></tr><tr
        ><td>Rate Limited Search:</td><td>{rateLimitedSearchText}</td></tr
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
