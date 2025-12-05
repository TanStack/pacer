import { useState } from 'preact/hooks'
import { render } from 'preact'
import type { JSX } from 'preact'
import { useAsyncDebouncedCallback } from '@tanstack/preact-pacer/async-debouncer'

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

  // Create async debounced function - Stable reference provided by useAsyncDebouncedCallback
  const debouncedSearch = useAsyncDebouncedCallback(
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
      wait: 500,
      // leading: true, // optional, defaults to false
      // trailing: true, // optional, defaults to true
    },
  )

  async function handleSearchChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = e.currentTarget.value
    setSearchTerm(newValue)

    try {
      await debouncedSearch(newValue)
    } catch (err) {
      // Error is already handled in the debounced function
      console.log('Search failed:', err)
    }
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncDebouncedCallback Example 1</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={searchTerm}
          onInput={handleSearchChange}
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

  // Create async debounced increment function
  const debouncedIncrement = useAsyncDebouncedCallback(
    async (currentValue: number) => {
      const result = await incrementApi(currentValue)
      setCount(result)
      return result
    },
    {
      wait: 1000,
      leading: false, // Don't execute immediately
      trailing: true, // Execute after delay
    },
  )

  function handleIncrement() {
    // Update local state immediately for instant feedback
    const newCount = count + 1
    setCount(newCount)

    // Debounced API call
    debouncedIncrement(newCount)
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncDebouncedCallback Example 2</h1>
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
          Increment (debounced API call)
        </button>
      </div>
      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Click rapidly - API calls are debounced to 1 second, but UI updates
        immediately
      </p>
    </div>
  )
}

function App3() {
  const [email, setEmail] = useState('')
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Simulate email validation API
  const validateEmail = async (
    emailAddress: string,
  ): Promise<{ isValid: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(emailAddress)

    return {
      isValid,
      message: isValid
        ? 'Email is valid!'
        : 'Please enter a valid email address',
    }
  }

  // Create debounced validation function
  const debouncedValidateEmail = useAsyncDebouncedCallback(
    async (emailAddress: string) => {
      if (!emailAddress.trim()) {
        setValidationResult(null)
        return null
      }

      setIsValidating(true)

      try {
        const result = await validateEmail(emailAddress)
        setValidationResult(result)
        return result
      } finally {
        setIsValidating(false)
      }
    },
    {
      wait: 750,
      leading: false,
    },
  )

  function handleEmailChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newEmail = e.currentTarget.value
    setEmail(newEmail)
    debouncedValidateEmail(newEmail)
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncDebouncedCallback Example 3</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Email Address:
          <input
            type="email"
            value={email}
            onInput={handleEmailChange}
            placeholder="Enter your email..."
            style={{
              width: '100%',
              marginTop: '5px',
              padding: '8px',
              borderColor:
                validationResult?.isValid === false
                  ? 'red'
                  : validationResult?.isValid === true
                    ? 'green'
                    : 'initial',
            }}
          />
        </label>
      </div>

      {isValidating && <p style={{ color: 'blue' }}>Validating email...</p>}

      {validationResult && (
        <p
          style={{
            color: validationResult.isValid ? 'green' : 'red',
            fontWeight: 'bold',
          }}
        >
          {validationResult.message}
        </p>
      )}

      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Email validation is debounced to 750ms after you stop typing
      </p>
    </div>
  )
}

const root = document.getElementById('root')!
render(
  <div>
    <App1 />
    <hr />
    <App2 />
    <hr />
    <App3 />
  </div>,
  root,
)
