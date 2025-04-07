import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { useRateLimitedCallback } from '@tanstack/solid-pacer/rate-limiter'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [rateLimitedCount, setRateLimitedCount] = createSignal(0)

  // Create rateLimited setter function - Stable reference provided by useRateLimitedCallback
  const rateLimitedSetCount = useRateLimitedCallback(setRateLimitedCount, {
    limit: 5,
    window: 5000,
    enabled: instantCount() > 2,
    onReject: ({ msUntilNextWindow }) => {
      console.log(`Rate limit reached. Try again in ${msUntilNextWindow}ms`)
    },
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      rateLimitedSetCount(newInstantCount) // rateLimited state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedCallback Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>RateLimited Count:</td>
            <td>{rateLimitedCount()}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button onClick={increment}>Increment</button>
      </div>
    </div>
  )
}

function App2() {
  const [searchText, setSearchText] = createSignal('')
  const [rateLimitedSearchText, setRateLimitedSearchText] = createSignal('')

  // Create rateLimited setter function - Stable reference provided by useRateLimitedCallback
  const rateLimitedSetSearch = useRateLimitedCallback(
    setRateLimitedSearchText,
    {
      limit: 5,
      window: 5000,
      enabled: searchText.length > 2,
      onReject: ({ msUntilNextWindow }) => {
        console.log(`Rate limit reached. Try again in ${msUntilNextWindow}ms`)
      },
    },
  )

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setSearchText(newValue)
    rateLimitedSetSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedCallback Example 2</h1>
      <div>
        <input
          type="text"
          value={searchText()}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>{searchText()}</td>
          </tr>
          <tr>
            <td>RateLimited Search:</td>
            <td>{rateLimitedSearchText()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

render(
  () => (
    <div>
      <App1 />
      <hr />
      <App2 />
    </div>
  ),
  document.getElementById('root')!,
)
