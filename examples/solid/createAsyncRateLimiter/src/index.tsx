import { For, Show, createSignal, onCleanup, onMount } from 'solid-js'
import { render } from 'solid-js/web'
import { createAsyncRateLimiter } from '@tanstack/solid-pacer/async-rate-limiter'
import { PacerProvider } from '@tanstack/solid-pacer/provider'

interface SearchResult {
  id: number
  title: string
}

// Simulate API call with fake data
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}

function App() {
  const [windowType, setWindowType] = createSignal<'fixed' | 'sliding'>('fixed')
  const [searchTerm, setSearchTerm] = createSignal('')
  const [results, setResults] = createSignal<Array<SearchResult>>([])
  const [error, setError] = createSignal<Error | null>(null)

  // The function that will become rate limited
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

  // hook that gives you an async rate limiter instance
  const setSearchAsyncRateLimiter = createAsyncRateLimiter(
    handleSearch,
    {
      get windowType() {
        return windowType()
      },
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
        setError(error)
        setResults([])
      },
    },
    // Alternative to setSearchAsyncRateLimiter.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => state,
  )

  // get and name our rate limited function
  const handleSearchRateLimited = setSearchAsyncRateLimiter.maybeExecute

  onMount(() => console.log('mount'))
  onCleanup(() => {
    console.log('unmount')
    setSearchAsyncRateLimiter.reset()
  })

  // instant event handler that calls both the instant local state setter and the rate limited function
  async function onSearchChange(e: Event) {
    const newTerm = (e.currentTarget as HTMLInputElement).value
    setSearchTerm(newTerm)
    await handleSearchRateLimited(newTerm) // optionally await if you need to
  }

  return (
    <div>
      <h1>TanStack Pacer createAsyncRateLimiter Example</h1>
      <div style={{ display: 'grid', gap: '0.5rem', 'margin-bottom': '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType"
            value="fixed"
            checked={windowType() === 'fixed'}
            onInput={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType"
            value="sliding"
            checked={windowType() === 'sliding'}
            onInput={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
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
      <setSearchAsyncRateLimiter.Subscribe
        selector={(state) => ({
          successCount: state.successCount,
          rejectionCount: state.rejectionCount,
          isExecuting: state.isExecuting,
        })}
      >
        {(state) => (
          <div>
            <table>
              <tbody>
                <tr>
                  <td>API calls made:</td>
                  <td>{state().successCount}</td>
                </tr>
                <tr>
                  <td>Rejected calls:</td>
                  <td>{state().rejectionCount}</td>
                </tr>
                <tr>
                  <td>Is executing:</td>
                  <td>{state().isExecuting ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Results:</td>
                  <td>
                    {results().length > 0 ? (
                      <ul>
                        <For each={results()}>
                          {(item) => <li>{item.title}</li>}
                        </For>
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
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state(), null, 2)}
          </pre>
        )}
      </setSearchAsyncRateLimiter.Subscribe>
    </div>
  )
}

function Root() {
  const [mounted, setMounted] = createSignal(true)
  const toggle = (event: KeyboardEvent) => {
    if (event.key === 'Enter') setMounted((value) => !value)
  }
  document.addEventListener('keydown', toggle)
  onCleanup(() => document.removeEventListener('keydown', toggle))
  return (
    <PacerProvider>
      <Show when={mounted()}>
        <App />
      </Show>
    </PacerProvider>
  )
}

render(() => <Root />, document.getElementById('root')!)
