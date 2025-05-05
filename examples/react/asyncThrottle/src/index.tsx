import { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { asyncThrottle } from '@tanstack/react-pacer/async-throttler'

function SearchApp() {
  const [searchText, setSearchText] = useState('')
  const [throttledSearchText, setThrottledSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<Array<string>>([])
  const [loading, setLoading] = useState(false)

  // Simulate search API
  const simulateSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return [
      `Result 1 for ${query}`,
      `Result 2 for ${query}`,
      `Result 3 for ${query}`,
    ]
  }

  const throttledSetSearch = useCallback(
    asyncThrottle(
      async (value: string) => {
        try {
          setLoading(true)
          setThrottledSearchText(value)
          const results = await simulateSearch(value)
          setSearchResults(results)
        } catch (err) {
          setSearchResults([])
        } finally {
          setLoading(false)
        }
      },
      {
        wait: 1000,
      },
    ),
    [],
  )

  return (
    <div>
      <h1>TanStack Pacer asyncThrottle Example</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={searchText}
          onChange={(e) => {
            const newValue = e.target.value
            setSearchText(newValue)
            throttledSetSearch(newValue)
          }}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
        {loading && <div>Loading...</div>}
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>{searchText}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>{throttledSearchText}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <h3>Search Results:</h3>
        <ul>
          {searchResults.map((result, i) => (
            <li key={i}>{result}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<SearchApp />)
