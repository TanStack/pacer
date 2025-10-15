import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncThrottledCallback } from '@tanstack/react-pacer/async-throttler'

interface SearchResult {
  id: number
  title: string
}

// Simulate API call with fake data
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
  if (term === 'error') {
    throw new Error('Simulated API error')
  }
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}

function App1() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Array<SearchResult>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create async throttled function - Stable reference provided by useAsyncThrottledCallback
  const throttledSearch = useAsyncThrottledCallback(
    async (term: string) => {
      if (!term.trim()) {
        setResults([])
        return []
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fakeApi(term)
        setResults(data)
        return data
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        setResults([])
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    {
      wait: 1000,
      // leading: true, // optional, defaults to true
      // trailing: true, // optional, defaults to true
    },
  )

  async function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setSearchTerm(newValue)

    try {
      await throttledSearch(newValue)
    } catch (err) {
      // Error is already handled in the throttled function
      console.log('Search failed:', err)
    }
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncThrottledCallback Example 1</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Type to search... (try 'error' to see error handling)"
          style={{ width: '100%', marginBottom: '10px' }}
        />
      </div>

      {isLoading && <p style={{ color: 'blue' }}>Searching...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div>
        <p>Current search term: {searchTerm}</p>
        {results.length > 0 && (
          <div>
            <h3>Results:</h3>
            <ul>
              {results.map((result) => (
                <li key={result.id}>{result.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function App2() {
  const [count, setCount] = useState(0)
  const [apiCallCount, setApiCallCount] = useState(0)

  // Simulate API call that returns a value
  const incrementApi = async (value: number): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newCount = value + 1
    setApiCallCount((prev) => prev + 1)
    return newCount
  }

  // Create async throttled increment function
  const throttledIncrement = useAsyncThrottledCallback(
    async (currentValue: number) => {
      const result = await incrementApi(currentValue)
      setCount(result)
      return result
    },
    {
      wait: 1000,
      leading: true, // Execute immediately on first call
      trailing: true, // Execute after throttle period ends
    },
  )

  function handleIncrement() {
    // Update local state immediately for instant feedback
    setCount((prev) => {
      const newCount = prev + 1
      throttledIncrement(newCount)
      return newCount
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncThrottledCallback Example 2</h1>
      <table>
        <tbody>
          <tr>
            <td>Current Count:</td>
            <td>{count}</td>
          </tr>
          <tr>
            <td>API Calls Made:</td>
            <td>{apiCallCount}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button onClick={handleIncrement}>
          Increment (throttled API call)
        </button>
      </div>
      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Click rapidly - API calls are throttled to 1 second, but UI updates
        immediately. First click executes immediately, then at most once per
        second.
      </p>
    </div>
  )
}

function App3() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [saveCount, setSaveCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Simulate saving scroll position to server
  const saveScrollPosition = async (
    position: number,
  ): Promise<{ success: boolean; position: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true, position }
  }

  // Create throttled save function
  const throttledSave = useAsyncThrottledCallback(
    async (position: number) => {
      setIsSaving(true)

      try {
        const result = await saveScrollPosition(position)
        setSaveCount((prev) => prev + 1)
        setLastSaved(new Date())
        return result
      } finally {
        setIsSaving(false)
      }
    },
    {
      wait: 1000,
      leading: true,
      trailing: true,
    },
  )

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const position = e.currentTarget.scrollTop
    setScrollPosition(position)
    throttledSave(position)
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncThrottledCallback Example 3</h1>
      <div
        style={{
          height: '200px',
          overflow: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '20px',
        }}
        onScroll={handleScroll}
      >
        <div style={{ height: '1000px' }}>
          <p>Scroll this area to trigger throttled saves!</p>
          <p>Current scroll position: {Math.round(scrollPosition)}px</p>
          {isSaving && <p style={{ color: 'blue' }}>Saving position...</p>}
          <div style={{ marginTop: '20px' }}>
            <p>Saves triggered: {saveCount}</p>
            {lastSaved && (
              <p>Last saved at: {lastSaved.toLocaleTimeString()}</p>
            )}
          </div>
          <div style={{ marginTop: '40px' }}>
            <p>Keep scrolling...</p>
            <p style={{ marginTop: '100px' }}>More content...</p>
            <p style={{ marginTop: '100px' }}>Even more content...</p>
            <p style={{ marginTop: '100px' }}>Almost there...</p>
            <p style={{ marginTop: '100px' }}>You made it to the end!</p>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Scroll position is saved at most once per second, but updates instantly
        on screen
      </p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
    <hr />
    <App3 />
  </div>,
)
