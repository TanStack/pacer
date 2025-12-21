import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncDebouncer } from '@tanstack/react-pacer/async-debouncer'
import { PacerProvider } from '@tanstack/react-pacer/provider'

interface SearchResult {
  id: number
  title: string
}

// Simulate API call with fake data
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Array<SearchResult>>([])

  // The function that will become debounced
  const handleSearch = async (term: string) => {
    if (!term) {
      setResults([])
      return
    }
    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it

    const data = await fakeApi(term)
    setResults(data)

    return data // this could alternatively be a void function without a return
  }

  // hook that gives you an async debouncer instance
  const asyncDebouncer = useAsyncDebouncer(
    handleSearch,
    {
      // leading: true, // optional leading execution
      wait: 500, // Wait 500ms between API calls
      onError: (error) => {
        // optional error handler
        console.error('Search failed:', error)
        setResults([])
      },
      // throwOnError: true,
      asyncRetryerOptions: {
        maxAttempts: 3,
        maxExecutionTime: 1000,
      },
    },
    // Alternative to asyncDebouncer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  // get and name our debounced function
  const handleSearchDebounced = asyncDebouncer.maybeExecute

  // instant event handler that calls both the instant local state setter and the debounced function
  async function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTerm = e.target.value
    setSearchTerm(newTerm)
    const result = await handleSearchDebounced(newTerm) // optionally await result if you need to
    console.log('result', result)
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncDebouncer Example</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
          autoComplete="new-password"
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={() => asyncDebouncer.flush()}>Flush</button>
      </div>
      <asyncDebouncer.Subscribe
        selector={(state) => ({
          isExecuting: state.isExecuting,
          isPending: state.isPending,
          successCount: state.successCount,
        })}
      >
        {({ isExecuting, isPending, successCount }) => (
          <div>
            <p>API calls made: {successCount}</p>
            {results.length > 0 && (
              <ul>
                {results.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            )}
            {isPending && <p>Pending...</p>}
            {isExecuting && <p>Executing...</p>}
          </div>
        )}
      </asyncDebouncer.Subscribe>
      <asyncDebouncer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </asyncDebouncer.Subscribe>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)

function renderApp(mounted: boolean) {
  root.render(
    mounted ? (
      // defaultOptions can be provided to the PacerProvider to set default options for all instances
      <PacerProvider
      // defaultOptions={{
      //   asyncDebouncer: {
      //     leading: true,
      //   },
      // }}
      >
        <App />
      </PacerProvider>
    ) : null,
  )
}

let mounted = true
renderApp(mounted)

document.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.key === 'Enter') {
    mounted = !mounted
    renderApp(mounted)
  }
})
