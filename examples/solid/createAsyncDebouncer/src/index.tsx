import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createAsyncDebouncer } from '@tanstack/solid-pacer/async-debouncer'

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
  const [executionCount, setExecutionCount] = createSignal(0)

  // The function that will become debounced
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

    console.log(setSearchAsyncDebouncer.executionCount())
  }

  // hook that gives you an async debouncer instance
  const setSearchAsyncDebouncer = createAsyncDebouncer(handleSearch, {
    wait: 500, // Wait 500ms between API calls
    onError: (error) => {
      // optional error handler
      console.error('Search failed:', error)
      setError(error as Error)
      setResults([])
    },
    onExecute: (asyncDebouncer) => {
      setExecutionCount(asyncDebouncer.getExecutionCount())
    },
  })

  // get and name our debounced function
  const handleSearchDebounced = setSearchAsyncDebouncer.maybeExecute

  // instant event handler that calls both the instant local state setter and the debounced function
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
    setSearchTerm(newTerm)
    await handleSearchDebounced(newTerm) // optionally await if you need to
  }

  return (
    <div>
      <h1>TanStack Pacer createAsyncDebouncer Example</h1>
      <div>
        <input
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
        <p>API calls made: {executionCount()}</p>
        {results().length > 0 && (
          <ul>
            {results().map((item) => (
              <li>{item.title}</li>
            ))}
          </ul>
        )}
        {isLoading() && <p>Loading...</p>}
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
