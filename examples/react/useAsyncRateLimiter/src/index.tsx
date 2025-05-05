import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncRateLimiter } from '@tanstack/react-pacer/async-rate-limiter'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Array<SearchResult>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // The function that will become rate limited
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

    console.log(setSearchAsyncRateLimiter.getSuccessCount())
  }

  // hook that gives you an async rate limiter instance
  const setSearchAsyncRateLimiter = useAsyncRateLimiter(handleSearch, {
    limit: 2, // Maximum 2 requests
    window: 1000, // per 1 second
    onError: (error) => {
      // optional error handler
      console.error('Search failed:', error)
      setError(error as Error)
      setResults([])
    },
  })

  // get and name our rate limited function
  const handleSearchRateLimited = setSearchAsyncRateLimiter.maybeExecute

  useEffect(() => {
    console.log('mount')
    return () => {
      console.log('unmount')
      setSearchAsyncRateLimiter.reset() // cancel any pending async calls when the component unmounts
    }
  }, [])

  // instant event handler that calls both the instant local state setter and the rate limited function
  async function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTerm = e.target.value
    setSearchTerm(newTerm)
    await handleSearchRateLimited(newTerm) // optionally await if you need to
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncRateLimiter Example</h1>
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
      {error && <div>Error: {error.message}</div>}
      <div>
        <p>API calls made: {setSearchAsyncRateLimiter.getSuccessCount()}</p>
        {results.length > 0 && (
          <ul>
            {results.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        )}
        {isLoading && <p>Loading...</p>}
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)

let mounted = true
root.render(<App />)

// demo unmounting and cancellation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    mounted = !mounted
    root.render(mounted ? <App /> : null)
  }
})
