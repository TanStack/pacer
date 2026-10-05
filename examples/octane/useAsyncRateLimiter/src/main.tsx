import { createRoot, useLayoutEffect } from 'octane'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { useEffect, useState } from 'octane'
import { useAsyncRateLimiter } from '@tanstack/octane-pacer/async-rate-limiter'
import { PacerProvider } from '@tanstack/octane-pacer/provider'
interface SearchResult {
  id: number
  title: string
}
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}

function App() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
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
  }
  const setSearchAsyncRateLimiter = useAsyncRateLimiter(
    handleSearch,
    {
      key: 'useAsyncRateLimiter',
      windowType: windowType,
      limit: 3, // Maximum 3 requests
      window: 3000, // per 3 seconds
      onReject: (_args, rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
      onError: (error) => {
        // optional error handler
        console.error('Search failed:', error)
        setError(error as Error)
        setResults([])
      },
    },
    // Alternative to setSearchAsyncRateLimiter.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )
  const handleSearchRateLimited = setSearchAsyncRateLimiter.maybeExecute
  useEffect(() => {
    console.log('mount')
    return () => {
      console.log('unmount')
      setSearchAsyncRateLimiter.reset() // cancel any pending async calls when the component unmounts
    }
  }, [])
  async function onSearchChange(e: Event) {
    const newTerm = (e.target as HTMLInputElement).value
    setSearchTerm(newTerm)
    await handleSearchRateLimited(newTerm) // optionally await if you need to
  }
  return (
    <div>
      <h1>TanStack Pacer useAsyncRateLimiter Example</h1>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType"
            value="fixed"
            checked={windowType === 'fixed'}
            onInput={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType"
            value="sliding"
            checked={windowType === 'sliding'}
            onInput={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
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
      {error && <div>Error: {error.message}</div>}
      <setSearchAsyncRateLimiter.Subscribe
        selector={(state) => ({
          successCount: state.successCount,
          rejectionCount: state.rejectionCount,
          isExecuting: state.isExecuting,
        })}
      >
        {({ successCount, rejectionCount, isExecuting }) => (
          <div>
            <table>
              <tbody>
                <tr>
                  <td>API calls made:</td>
                  <td>{successCount}</td>
                </tr>
                <tr>
                  <td>Rejected calls:</td>
                  <td>{rejectionCount}</td>
                </tr>
                <tr>
                  <td>Is executing:</td>
                  <td>{isExecuting ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Results:</td>
                  <td>
                    {results.length > 0 ? (
                      <ul>
                        {results.map((item) => (
                          <li key={item.id}>{item.title}</li>
                        ))}
                      </ul>
                    ) : (
                      'No results'
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </setSearchAsyncRateLimiter.Subscribe>
      <setSearchAsyncRateLimiter.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setSearchAsyncRateLimiter.Subscribe>
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
        //   rateLimiter: {
        //     limit: 5,
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
