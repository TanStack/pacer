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
  const [windowType, setWindowType] = createSignal<'fixed' | 'sliding'>('fixed')
  const [searchTerm, setSearchTerm] = createSignal('')
  const [results, setResults] = createSignal<Array<SearchResult>>([])

  // The function that will become rate limited
  const handleSearch = async (term: string) => {
    if (!term) {
      setResults([])
      return
    }

    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it

    const data = await fakeApi(term)
    setResults(data)

    console.log(setSearchAsyncRateLimiter.state().successCount)
  }

  // hook that gives you an async rate limiter instance
  const setSearchAsyncRateLimiter = createAsyncRateLimiter(handleSearch, {
    windowType: windowType(),
    limit: 2, // Maximum 2 requests
    window: 1000, // per 1 second
    onError: (error) => {
      // optional error handler
      console.error('Search failed:', error)
      setResults([])
    },
    onReject: (rateLimiter) => {
      console.log(
        'Rate limit exceeded:',
        rateLimiter.store.state.rejectionCount,
      )
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
      <div style={{ display: 'grid', gap: '0.5rem', 'margin-bottom': '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType"
            value="fixed"
            checked={windowType() === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType"
            value="sliding"
            checked={windowType() === 'sliding'}
            onChange={() => setWindowType('sliding')}
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
      <div>
        <p>API calls made: {setSearchAsyncRateLimiter.state().successCount}</p>
        {results().length > 0 && (
          <ul>
            <For each={results()}>{(item) => <li>{item.title}</li>}</For>
          </ul>
        )}
        {setSearchAsyncRateLimiter.state().isExecuting && <p>Loading...</p>}
      </div>
      <pre style={{ 'margin-top': '20px' }}>
        {JSON.stringify(setSearchAsyncRateLimiter.state(), null, 2)}
      </pre>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
