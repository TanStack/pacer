import { createRoot, useLayoutEffect } from 'octane'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { useState } from 'octane'
import { useAsyncThrottler } from '@tanstack/octane-pacer/async-throttler'
import { PacerProvider } from '@tanstack/octane-pacer/provider'
interface SearchResult {
  id: number
  title: string
}
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Array<SearchResult>>([])
  const [error, setError] = useState<Error | null>(null)
  const handleSearch = async (term: string) => {
    if (!term) {
      setResults([])
      return
    }

    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it

    const data = await fakeApi(term)
    setResults(data)
    setError(null)

    return data // this could alternatively be a void function without a return
  }
  const setSearchAsyncThrottler = useAsyncThrottler(
    handleSearch,
    {
      key: 'useAsyncThrottler',
      // leading: true, // default
      // trailing: true, // default
      wait: 1000, // Wait 1 second between API calls
      onError: (error) => {
        // optional error handler
        console.error('Search failed:', error)
        setError(error as Error)
        setResults([])
      },
      // throwOnError: true,
    },
    // Alternative to setSearchAsyncThrottler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )
  const handleSearchThrottled = setSearchAsyncThrottler.maybeExecute
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
    setSearchTerm(newTerm)
    const result = await handleSearchThrottled(newTerm) // optionally await if you need to
    console.log('result', result)
  }
  return (
    <div>
      <h1>TanStack Pacer useAsyncThrottler Example</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={searchTerm}
          onInput={onSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
          autoComplete="new-password"
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={() => setSearchAsyncThrottler.flush()}>Flush</button>
      </div>
      {error && <div>Error: {error.message}</div>}
      <setSearchAsyncThrottler.Subscribe
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
            {isPending ? (
              <p>Pending...</p>
            ) : isExecuting ? (
              <p>Executing...</p>
            ) : null}
          </div>
        )}
      </setSearchAsyncThrottler.Subscribe>
      <setSearchAsyncThrottler.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setSearchAsyncThrottler.Subscribe>
    </div>
  )
}

function PacerExample() {
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return
    const target = document.createElement('div')
    document.body.append(target)
    const host = new TanStackDevtoolsCore({ plugins: [pacerDevtoolsPlugin()] })
    host.mount(target)
    return () => {
      host.unmount()
      target.remove()
    }
  }, [])
  // Keep Solid's document-level devtools delegation outside Octane's application events.
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onInput={(event) => event.stopPropagation()}
    >
      <PacerProvider
      // defaultOptions={{
      //   throttler: {
      //     leading: true,
      //   },
      // }}
      >
        <App />
      </PacerProvider>
    </div>
  )
}
createRoot(document.getElementById('app')!).render(PacerExample)
