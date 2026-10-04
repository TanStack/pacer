<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createAsyncDebouncer } from '@tanstack/svelte-pacer/async-debouncer'

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

  const debouncedSearch = createAsyncDebouncer(
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
  ).maybeExecute

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

  let email = $state('')

  let validationResult = $state<{
    isValid: boolean
    message: string
  } | null>(null)

  let isValidating = $state(false)

  // Simulate email validation API
  const validateEmail = async (
    emailAddress: string,
  ): Promise<{
    isValid: boolean
    message: string
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(emailAddress)
    return {
      isValid,
      message: isValid
        ? 'Email is valid!'
        : 'Please enter a valid email address',
    }
  }

  const debouncedValidateEmail = createAsyncDebouncer(
    async (emailAddress: string) => {
      if (!emailAddress.trim()) {
        validationResult = null
        return null
      }
      isValidating = true
      try {
        const result = await validateEmail(emailAddress)
        validationResult = result
        return result
      } finally {
        isValidating = false
      }
    },
    () => ({
      wait: 750,
      leading: false,
    }),
  ).maybeExecute

  function handleEmailChange(e: Event) {
    const newEmail = (e.target as HTMLInputElement).value
    email = newEmail
    debouncedValidateEmail(newEmail)
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

  const debouncedIncrement = createAsyncDebouncer(
    async (currentValue: number) => {
      const result = await incrementApi(currentValue)
      count = result
      return result
    },
    () => ({
      wait: 1000,
      leading: false, // Don't execute immediately
      trailing: true, // Execute after delay
    }),
  ).maybeExecute

  function handleIncrement() {
    // Update local state immediately for instant feedback
    const newCount = count + 1
    count = newCount
    // Debounced API call
    debouncedIncrement(newCount)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createAsyncDebouncer Example 1</h1>
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
    <h1>TanStack Pacer createAsyncDebouncer Example 2</h1>
    <table>
      <tbody
        ><tr><td>Current Count:</td><td>{count}</td></tr><tr
          ><td>API Calls Made:</td><td>{apiCallCount}</td></tr
        ></tbody
      >
    </table>
    <div>
      <button onclick={handleIncrement}>Increment (debounced API call)</button>
    </div>
    <p style="font-size: 0.9em; color: #666">
      Click rapidly - API calls are debounced to 1 second, but UI updates
      immediately
    </p>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createAsyncDebouncer Example 3</h1>
    <div style="margin-bottom: 20px">
      <label
        >Email Address:<input
          type="email"
          value={email}
          oninput={handleEmailChange}
          placeholder="Enter your email..."
          style={`width: 100%; margin-top: 5px; padding: 8px; border-color: ${
            validationResult?.isValid === false
              ? 'red'
              : validationResult?.isValid === true
                ? 'green'
                : 'initial'
          }`}
        /></label
      >
    </div>
    {#if isValidating}<p style="color: blue">
        Validating email...
      </p>{/if}{#if validationResult}<p
        style={`color: ${validationResult.isValid ? 'green' : 'red'}; font-weight: bold`}
      >
        {validationResult.message}
      </p>{/if}
    <p style="font-size: 0.9em; color: #666">
      Email validation is debounced to 750ms after you stop typing
    </p>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
