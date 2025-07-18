import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useRateLimitedCallback } from '@tanstack/react-pacer/rate-limiter'

function App1() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [rateLimitedCount, setRateLimitedCount] = useState(0)

  // Create rateLimited setter function - Stable reference provided by useRateLimitedCallback
  const rateLimitedSetCount = useRateLimitedCallback(setRateLimitedCount, {
    limit: 5,
    window: 5000,
    windowType: windowType,
    enabled: () => instantCount > 2,
    onReject: (rateLimiter) => {
      console.log(
        `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
      )
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
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType"
            value="fixed"
            checked={windowType === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType"
            value="sliding"
            checked={windowType === 'sliding'}
            onChange={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount}</td>
          </tr>
          <tr>
            <td>RateLimited Count:</td>
            <td>{rateLimitedCount}</td>
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
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
  const [searchText, setSearchText] = useState('')
  const [rateLimitedSearchText, setRateLimitedSearchText] = useState('')

  // Create rateLimited setter function - Stable reference provided by useRateLimitedCallback
  const rateLimitedSetSearch = useRateLimitedCallback(
    setRateLimitedSearchText,
    {
      limit: 5,
      window: 5000,
      windowType: windowType,
      enabled: () => searchText.length > 2,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    },
  )

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setSearchText(newValue)
    rateLimitedSetSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedCallback Example 2</h1>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType2"
            value="fixed"
            checked={windowType === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType2"
            value="sliding"
            checked={windowType === 'sliding'}
            onChange={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
      <div>
        <input
          autoFocus
          type="search"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>{searchText}</td>
          </tr>
          <tr>
            <td>RateLimited Search:</td>
            <td>{rateLimitedSearchText}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
  const [currentValue, setCurrentValue] = useState(50)
  const [limitedValue, setLimitedValue] = useState(50)

  // Create rateLimited setter function - Stable reference provided by useRateLimitedCallback
  const rateLimitedSetValue = useRateLimitedCallback(setLimitedValue, {
    limit: 20,
    window: 2000,
    windowType: windowType,
    onReject: (rateLimiter) => {
      console.log(
        `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
      )
    },
  })

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    rateLimitedSetValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedCallback Example 3</h1>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType3"
            value="fixed"
            checked={windowType === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType3"
            value="sliding"
            checked={windowType === 'sliding'}
            onChange={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue}
            onChange={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{currentValue}</span>
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Rate Limited Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={limitedValue}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{limitedValue}</span>
        </label>
      </div>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Rate limited to 20 updates per 2 seconds</p>
      </div>
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
