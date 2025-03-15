import { scan } from 'react-scan' // dev-tools for demo
import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncQueuer } from '@tanstack/react-bouncer/async-queuer'

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
  const [activeSearches, setActiveSearches] = useState(0)
  const [pendingSearches, setPendingSearches] = useState(0)

  // Initialize the async queuer with concurrency control and callbacks
  const searchQueuer = useAsyncQueuer<Array<SearchResult>>({
    concurrency: 2, // Only allow 2 concurrent searches
    started: true, // Start processing tasks immediately
    onUpdate: () => {
      setActiveSearches(searchQueuer.getActive().length)
      setPendingSearches(searchQueuer.getPending().length)
    },
  })

  // Set up error and success handlers
  useEffect(() => {
    const removeErrorHandler = searchQueuer.onError((error) => {
      console.error('Search failed:', error)
      setError(error as Error)
      setResults([])
      setIsLoading(false)
    })

    const removeSuccessHandler = searchQueuer.onSuccess((results) => {
      setResults(results)
      setIsLoading(false)
      setError(null)
    })

    return () => {
      removeErrorHandler()
      removeSuccessHandler()
      searchQueuer.clear() // Clear any pending tasks on unmount
    }
  }, [])

  // Queue a new search task
  function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTerm = e.target.value
    setSearchTerm(newTerm)

    if (!newTerm) {
      setResults([])
      return
    }

    setIsLoading(true)

    // Queue the search task (will be processed based on concurrency settings)
    searchQueuer.enqueue(
      async () => {
        // Simulate high-priority searches for terms starting with "!"
        if (newTerm.startsWith('!')) {
          return await fakeApi(newTerm.slice(1))
        }
        return await fakeApi(newTerm)
      },
      // Add urgent searches to the front of the queue
      newTerm.startsWith('!') ? 'front' : 'back',
    )
  }

  // Add ability to control concurrency for demo purposes
  function updateConcurrency(n: number) {
    searchQueuer.throttle(n)
  }

  return (
    <div>
      <h1>TanStack Bouncer useAsyncQueuer Example</h1>
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Type to search... (prefix with ! for high priority)"
          style={{ width: '100%' }}
          autoComplete="new-password"
        />
      </div>
      <div>
        <button onClick={() => updateConcurrency(1)}>Single Task</button>
        <button onClick={() => updateConcurrency(2)}>Two Tasks</button>
        <button onClick={() => updateConcurrency(3)}>Three Tasks</button>
      </div>
      <div>
        <p>Active searches: {activeSearches}</p>
        <p>Pending searches: {pendingSearches}</p>
      </div>
      {error && <div>Error: {error.message}</div>}
      <div>
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

scan() // dev-tools for demo
