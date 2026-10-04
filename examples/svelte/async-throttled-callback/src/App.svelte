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

  const throttledSearch = createAsyncThrottler(
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
      wait: 1000,
      // leading: true, // optional, defaults to true
      // trailing: true, // optional, defaults to true
    }),
  ).maybeExecute

  async function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchTerm = newValue
    try {
      await throttledSearch(newValue)
    } catch (err) {
      // Error is already handled in the throttled function
      console.log('Search failed:', err)
    }
  }

  let scrollPosition = $state(0)

  let saveCount = $state(0)

  let lastSaved = $state<Date | null>(null)

  let isSaving = $state(false)

  // Simulate saving scroll position to server
  const saveScrollPosition = async (
    position: number,
  ): Promise<{
    success: boolean
    position: number
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true, position }
  }

  const throttledSave = createAsyncThrottler(
    async (position: number) => {
      isSaving = true
      try {
        const result = await saveScrollPosition(position)
        saveCount = saveCount + 1
        lastSaved = new Date()
        return result
      } finally {
        isSaving = false
      }
    },
    () => ({
      wait: 1000,
      leading: true,
      trailing: true,
    }),
  ).maybeExecute

  function handleScroll(e: Event) {
    const position = (e.currentTarget as HTMLInputElement).scrollTop
    scrollPosition = position
    throttledSave(position)
  }

  let count = $state(0)

  let apiCallCount = $state(0)

  // Simulate API call that returns a value
  const incrementApi = async (value: number): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newCount = value + 1
    apiCallCount = apiCallCount + 1
    return newCount
  }

  const throttledIncrement = createAsyncThrottler(
    async (currentValue: number) => {
      const result = await incrementApi(currentValue)
      count = result
      return result
    },
    () => ({
      wait: 1000,
      leading: true, // Execute immediately on first call
      trailing: true, // Execute after throttle period ends
    }),
  ).maybeExecute

  function handleIncrement() {
    // Update local state immediately for instant feedback
    count = ((prev) => {
      const newCount = prev + 1
      throttledIncrement(newCount)
      return newCount
    })(count)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createAsyncThrottler Example 1</h1>
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
            {#each results as result, index (index)}<li>
                {result.title}
              </li>{/each}
          </ul>
        </div>{/if}
    </div>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createAsyncThrottler Example 2</h1>
    <table>
      <tbody
        ><tr><td>Current Count:</td><td>{count}</td></tr><tr
          ><td>API Calls Made:</td><td>{apiCallCount}</td></tr
        ></tbody
      >
    </table>
    <div>
      <button onclick={handleIncrement}>Increment (throttled API call)</button>
    </div>
    <p style="font-size: 0.9em; color: #666">
      Click rapidly - API calls are throttled to 1 second, but UI updates
      immediately. First click executes immediately, then at most once per
      second.
    </p>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createAsyncThrottler Example 3</h1>
    <div
      style="height: 200px; overflow: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 20px"
      onscroll={handleScroll}
    >
      <div style="height: 1000px">
        <p>Scroll this area to trigger throttled saves!</p>
        <p>Current scroll position: {Math.round(scrollPosition)}px</p>
        {#if isSaving}<p style="color: blue">Saving position...</p>{/if}
        <div style="margin-top: 20px">
          <p>Saves triggered: {saveCount}</p>
          {#if lastSaved}<p>
              Last saved at: {lastSaved.toLocaleTimeString()}
            </p>{/if}
        </div>
        <div style="margin-top: 40px">
          <p>Keep scrolling...</p>
          <p style="margin-top: 100px">More content...</p>
          <p style="margin-top: 100px">Even more content...</p>
          <p style="margin-top: 100px">Almost there...</p>
          <p style="margin-top: 100px">You made it to the end!</p>
        </div>
      </div>
    </div>
    <p style="font-size: 0.9em; color: #666">
      Scroll position is saved at most once per second, but updates instantly on
      screen
    </p>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
