<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createAsyncThrottler } from '@tanstack/svelte-pacer/async-throttler'

  interface SearchResult {
    id: number
    title: string
  }
  // Simulate API call with fake data
  const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  let searchTerm = $state('')

  let results = $state<Array<SearchResult>>([])

  let error = $state<Error | null>(null)

  // The function that will become throttled
  const handleSearch = async (term: string) => {
    if (!term) {
      results = []
      return
    }
    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
    const data = await fakeApi(term)
    results = data
    error = null
    return data // this could alternatively be a void function without a return
  }

  const setSearchAsyncThrottler = createAsyncThrottler(handleSearch, () => ({
    key: 'createAsyncThrottler',
    // leading: true, // default
    // trailing: true, // default
    wait: 1000, // Wait 1 second between API calls
    onError: (cause) => {
      // optional error handler
      console.error('Search failed:', cause)
      error = cause as Error
      results = []
    },
    // throwOnError: true,
  }))

  // get and name our throttled function
  const handleSearchThrottled = setSearchAsyncThrottler.maybeExecute

  // instant event handler that calls both the instant local state setter and the throttled function
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
    searchTerm = newTerm
    const result = await handleSearchThrottled(newTerm) // optionally await if you need to
    console.log('result', result)
  }
</script>

<div>
  <h1>TanStack Pacer createAsyncThrottler Example</h1>
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
  <div style="margin-top: 10px">
    <button onclick={() => setSearchAsyncThrottler.flush()}>Flush</button>
  </div>
  {#if error}<div>
      Error: {error.message}
    </div>{/if}<setSearchAsyncThrottler.Subscribe
    selector={(state) => ({
      isExecuting: state.isExecuting,
      isPending: state.isPending,
      successCount: state.successCount,
    })}
    >{#snippet children({ isExecuting, isPending, successCount })}<div>
        <p>API calls made: {successCount}</p>
        {#if results.length > 0}<ul>
            {#each results as item, index (index)}<li>{item.title}</li>{/each}
          </ul>{/if}{#if isPending}<p>Pending...</p>{:else}{#if isExecuting}<p>
              Executing...
            </p>{:else}{/if}{/if}
      </div>{/snippet}</setSearchAsyncThrottler.Subscribe
  ><setSearchAsyncThrottler.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</setSearchAsyncThrottler.Subscribe
  >
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
