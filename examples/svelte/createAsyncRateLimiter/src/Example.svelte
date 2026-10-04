<script lang="ts">
  import { onDestroy } from 'svelte'
  import { createAsyncRateLimiter } from '@tanstack/svelte-pacer/async-rate-limiter'
  interface SearchResult {
    id: number
    title: string
  }
  // Simulate API call with fake data
  const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let searchTerm = $state('')

  let results = $state<Array<SearchResult>>([])

  let error = $state<Error | null>(null)

  // The function that will become rate limited
  const handleSearch = async (term: string) => {
    if (!term) {
      results = []
      return
    }
    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
    const data = await fakeApi(term)
    results = data
    error = null
  }

  const setSearchAsyncRateLimiter = createAsyncRateLimiter(
    handleSearch,
    () => ({
      key: 'createAsyncRateLimiter',
      windowType: windowType,
      limit: 3, // Maximum 3 requests
      window: 3000, // per 3 seconds
      onReject: (_args, rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
      onError: (cause) => {
        // optional error handler
        console.error('Search failed:', cause)
        error = cause as Error
        results = []
      },
    }),
  )

  // get and name our rate limited function
  const handleSearchRateLimited = setSearchAsyncRateLimiter.maybeExecute

  onDestroy(() => {
    console.log('unmount')
    setSearchAsyncRateLimiter.reset() // cancel any pending async calls when the component unmounts
  })

  // instant event handler that calls both the instant local state setter and the rate limited function
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
    searchTerm = newTerm
    await handleSearchRateLimited(newTerm) // optionally await if you need to
  }
</script>

<div>
  <h1>TanStack Pacer createAsyncRateLimiter Example</h1>
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
    <!-- svelte-ignore a11y_autofocus: Focus the search field in this standalone demo. -->
    <input
      autofocus
      type="search"
      value={searchTerm}
      oninput={onSearchChange}
      placeholder="Type to search..."
      style="width: 100%"
      autocomplete="new-password"
    />
  </div>
  {#if error}<div>
      Error: {error.message}
    </div>{/if}<setSearchAsyncRateLimiter.Subscribe
    selector={(state) => ({
      successCount: state.successCount,
      rejectionCount: state.rejectionCount,
      isExecuting: state.isExecuting,
    })}
    >{#snippet children({ successCount, rejectionCount, isExecuting })}<div>
        <table>
          <tbody
            ><tr><td>API calls made:</td><td>{successCount}</td></tr><tr
              ><td>Rejected calls:</td><td>{rejectionCount}</td></tr
            ><tr><td>Is executing:</td><td>{isExecuting ? 'Yes' : 'No'}</td></tr
            ><tr
              ><td>Results:</td><td
                >{#if results.length > 0}<ul>
                    {#each results as item, index (index)}<li>
                        {item.title}
                      </li>{/each}
                  </ul>{:else}{'No results'}{/if}</td
              ></tr
            ></tbody
          >
        </table>
      </div>{/snippet}</setSearchAsyncRateLimiter.Subscribe
  ><setSearchAsyncRateLimiter.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</setSearchAsyncRateLimiter.Subscribe
  >
</div>
