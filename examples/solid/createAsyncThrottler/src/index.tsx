import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createAsyncThrottler } from '@tanstack/solid-pacer/async-throttler'

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
  const [error, setError] = createSignal<Error | null>(null)

  // The function that will become throttled
  const handleSearch = async (term: string) => {
    if (!term) {
      setResults([])
      return
    }

    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it

    const data = await fakeApi(term)
    setResults(data) // option 1: set results immediately
    setError(null)

    return data // option 2: return data if you need to
  }

  // hook that gives you an async throttler instance
  const setSearchAsyncThrottler = createAsyncThrottler(handleSearch, {
    wait: 1000, // Wait 1 second between API calls
    onError: (error) => {
      // optional error handler
      console.error('Search failed:', error)
      setError(error as Error)
      setResults([])
    },
  })

  // get and name our throttled function
  const handleSearchThrottled = setSearchAsyncThrottler.maybeExecute

  // instant event handler that calls both the instant local state setter and the throttled function
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
    setSearchTerm(newTerm)
    const results = await handleSearchThrottled(newTerm) // optionally await if you need to
    console.log('results', results)
  }

  return (
    <div>
      <h1>TanStack Pacer createAsyncThrottler Example</h1>
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
        <p>API calls made: {setSearchAsyncThrottler.successCount()}</p>
        <For each={results()}>{(item) => <li>{item.title}</li>}</For>
        {setSearchAsyncThrottler.isPending() ? (
          <p>Pending...</p>
        ) : setSearchAsyncThrottler.isExecuting() ? (
          <p>Executing...</p>
        ) : null}
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
