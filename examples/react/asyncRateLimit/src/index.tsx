import { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { asyncRateLimit } from '@tanstack/react-pacer/async-rate-limiter'

function SearchApp() {
  const [searchText, setSearchText] = useState('')
  const [rateLimitedSearchText, setRateLimitedSearchText] = useState('')
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

  const rateLimitedSetSearch = useCallback(
    asyncRateLimit(
      async (value: string) => {
        try {
          setLoading(true)
          setRateLimitedSearchText(value)
          const results = await simulateSearch(value)
          setSearchResults(results)
        } catch (err) {
          setSearchResults([])
        } finally {
          setLoading(false)
        }
      },
      {
        limit: 5,
        window: 5000,
        // windowType: 'sliding', // default is 'fixed'
        onReject: (rateLimiter) => {
          console.log(
            `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
          )
        },
      },
    ),
    [],
  )

  return (
    <div>
      <h1>TanStack Pacer asyncRateLimit Example</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={searchText}
          onChange={(e) => {
            const newValue = e.target.value
            setSearchText(newValue)
            rateLimitedSetSearch(newValue)
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
            <td>Rate Limited Search:</td>
            <td>{rateLimitedSearchText}</td>
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
