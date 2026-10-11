import { createRoot, useLayoutEffect } from 'octane'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { useState } from 'octane'
import { useAsyncDebouncer } from '@tanstack/octane-pacer/async-debouncer'
import { PacerProvider } from '@tanstack/octane-pacer/provider'
interface SearchResult {
  id: number
  title: string
}
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
  const asyncDebouncer = useAsyncDebouncer(
    handleSearch,
    {
      key: 'useAsyncDebouncer',
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
        maxExecutionTime: 3000,
      },
    },
    // Alternative to asyncDebouncer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )
  const handleSearchDebounced = asyncDebouncer.maybeExecute
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
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
          onInput={onSearchChange}
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
  const [mounted, setMounted] = useState(true)
  useLayoutEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'Enter') setMounted((value) => !value)
    }
    document.addEventListener('keydown', toggle)
    return () => document.removeEventListener('keydown', toggle)
  }, [])
  // Keep Solid's document-level devtools delegation outside Octane's application events.
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onInput={(event) => event.stopPropagation()}
    >
      {mounted ? (
        <PacerProvider
        // defaultOptions={{
        //   asyncDebouncer: {
        //     leading: true,
        //   },
        // }}
        >
          <App />
        </PacerProvider>
      ) : null}
    </div>
  )
}
createRoot(document.getElementById('app')!).render(PacerExample)
