import { createEffect, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { useAsyncDebouncer } from '@tanstack/solid-pacer/async-debouncer'

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

    console.log(setSearchAsyncDebouncer().getExecutionCount())
  }

  // hook that gives you an async debouncer instance
  const setSearchAsyncDebouncer = useAsyncDebouncer(handleSearch, {
    wait: 500, // Wait 500ms between API calls
    onError: (error) => {
      // optional error handler
      console.error('Search failed:', error)
      setError(error as Error)
      setResults([])
    },
  })

  // get and name our debounced function
  const handleSearchDebounced = setSearchAsyncDebouncer().maybeExecute

  createEffect(() => {
    console.log('mount')
    return () => {
      console.log('unmount')
      setSearchAsyncDebouncer().cancel() // cancel any pending async calls when the component unmounts
    }
  }, [])

  // instant event handler that calls both the instant local state setter and the debounced function
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
    setSearchTerm(newTerm)
    await handleSearchDebounced(newTerm) // optionally await if you need to
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncDebouncer Example</h1>
      <div>
        <input
          type="text"
          value={searchTerm()}
          onchange={onSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
          autocomplete="new-password"
        />
      </div>
      {error && <div>Error: {error()?.message}</div>}
      <div>
        <p>API calls made: {setSearchAsyncDebouncer().getExecutionCount()}</p>
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
