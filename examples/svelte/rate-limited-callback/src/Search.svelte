<script lang="ts">
  import { createRateLimiter } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let searchText = $state('')

  let searchTextRef = $state('')

  let rateLimitedSearchText = $state('')

  const rateLimitedSetSearch = createRateLimiter(
    (value: typeof rateLimitedSearchText) => {
      rateLimitedSearchText = value
    },
    () => ({
      limit: 5,
      window: 5000,
      windowType: windowType,
      enabled: () => searchTextRef.length > 2,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    }),
  ).maybeExecute

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchTextRef = newValue
    searchText = newValue
    rateLimitedSetSearch(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createRateLimiter Example 2</h1>
  <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
    <label
      ><input
        type="radio"
        name="windowType2"
        value="fixed"
        checked={windowType === 'fixed'}
        oninput={() => (windowType = 'fixed')}
      />Fixed Window</label
    ><label
      ><input
        type="radio"
        name="windowType2"
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
      oninput={handleSearchChange}
      placeholder="Type to search..."
      style="width: 100%"
    />
  </div>
  <table>
    <tbody
      ><tr><td>Instant Search:</td><td>{searchText}</td></tr><tr
        ><td>RateLimited Search:</td><td>{rateLimitedSearchText}</td></tr
      ></tbody
    >
  </table>
</div>
