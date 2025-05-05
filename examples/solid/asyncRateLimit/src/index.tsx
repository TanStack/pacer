import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { asyncRateLimit } from '@tanstack/solid-pacer/async-rate-limiter'

function SearchApp() {
  const [searchText, setSearchText] = createSignal('')
  const [rateLimitedSearchText, setRateLimitedSearchText] = createSignal('')
  const [searchResults, setSearchResults] = createSignal<Array<string>>([])
  const [loading, setLoading] = createSignal(false)

  // Simulate search API
  const simulateSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return [
      `Result 1 for ${query}`,
      `Result 2 for ${query}`,
      `Result 3 for ${query}`,
    ]
  }

  const rateLimitedSetSearch = asyncRateLimit(
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
      onReject: (rateLimiter) =>
        console.log(
          `Rate limit exceeded: ${rateLimiter.getMsUntilNextWindow()}ms until next window`,
        ),
    },
  )

  return (
    <div>
      <h1>TanStack Pacer asyncRateLimit Example</h1>
      <div>
        <input
          autofocus
          type="search"
          value={searchText()}
          onInput={(e) => {
            const target = e.target as HTMLInputElement
            const newValue = target.value
            setSearchText(newValue)
            rateLimitedSetSearch(newValue)
          }}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
        {loading() && <div>Loading...</div>}
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>{searchText()}</td>
          </tr>
          <tr>
            <td>Rate Limited Search:</td>
            <td>{rateLimitedSearchText()}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <h3>Search Results:</h3>
        <ul>
          <For each={searchResults()}>{(result) => <li>{result}</li>}</For>
        </ul>
      </div>
    </div>
  )
}

render(() => <SearchApp />, document.getElementById('root')!)
