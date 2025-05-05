import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createAsyncRateLimiter } from '@tanstack/solid-pacer/async-rate-limiter'

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

function App() {
  const [searchTerm, setSearchTerm] = createSignal('')
  const [results, setResults] = createSignal<Array<SearchResult>>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<Error | null>(null)

  // The function that will become rate limited
  const handleSearch = async (term: string) => {
    if (!term) {
      setResults([])
      return
    }

    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it

    if (!results.length) {
      setIsLoading(true)
    }

    const data = await fakeApi(term)
    setResults(data)
    setIsLoading(false)
    setError(null)

    console.log(setSearchAsyncRateLimiter.successCount())
  }

  // hook that gives you an async rate limiter instance
  const setSearchAsyncRateLimiter = createAsyncRateLimiter(handleSearch, {
    limit: 2, // Maximum 2 requests
    window: 1000, // per 1 second
    onError: (error) => {
      // optional error handler
      console.error('Search failed:', error)
      setError(error as Error)
      setResults([])
    },
  })

  // get and name our rate limited function
  const handleSearchRateLimited = setSearchAsyncRateLimiter.maybeExecute

  // instant event handler that calls both the instant local state setter and the rate limited function
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
    setSearchTerm(newTerm)
    await handleSearchRateLimited(newTerm) // optionally await if you need to
  }

  return (
    <div>
      <h1>TanStack Pacer createAsyncRateLimiter Example</h1>
      <div>
        <input
          autofocus
          type="search"
          value={searchTerm()}
          onInput={onSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
          autocomplete="new-password"
        />
      </div>
      {error() && <div>Error: {error()?.message}</div>}
      <div>
        <p>API calls made: {setSearchAsyncRateLimiter.successCount()}</p>
        {results().length > 0 && (
          <ul>
            <For each={results()}>{(item) => <li>{item.title}</li>}</For>
          </ul>
        )}
        {isLoading() && <p>Loading...</p>}
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
