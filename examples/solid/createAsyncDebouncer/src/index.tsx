import { For, createSignal } from 'solid-js'
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

  // The function that will become debounced
  const handleSearch = async (term: string) => {
    if (!term) {
      setResults([])
      return
    }

    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it

    const data = await fakeApi(term)
    setResults(data) // option 1: set results immediately

    return data // option 2: return data if you need to
  }

  // hook that gives you an async debouncer instance
  const setSearchAsyncDebouncer = createAsyncDebouncer(handleSearch, {
    // leading: true, // optional leading execution
    wait: 500, // Wait 500ms between API calls
    onError: (error) => {
      // optional error handler
      console.error('Search failed:', error)
      setResults([])
    },
  })

  // get and name our debounced function
  const handleSearchDebounced = setSearchAsyncDebouncer.maybeExecute

  // instant event handler that calls both the instant local state setter and the debounced function
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
    setSearchTerm(newTerm)
    const result = await handleSearchDebounced(newTerm) // ^option 2: await results
    console.log('result', result) // demo test to see awaited result
  }

  return (
    <div>
      <h1>TanStack Pacer createAsyncDebouncer Example</h1>
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
      {setSearchAsyncDebouncer.store.errorCount > 0 && (
        <div>Errors: {setSearchAsyncDebouncer.store.errorCount}</div>
      )}
      <div>
        <p>API calls made: {setSearchAsyncDebouncer.store.successCount}</p>
        {results().length > 0 && (
          <ul>
            <For each={results()}>{(item) => <li>{item.title}</li>}</For>
          </ul>
        )}
        {setSearchAsyncDebouncer.store.isExecuting && <p>Executing...</p>}
        {setSearchAsyncDebouncer.store.isPending && <p>Pending...</p>}
        <hr />
        <pre>
          {JSON.stringify({ store: setSearchAsyncDebouncer.store }, null, 2)}
        </pre>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
