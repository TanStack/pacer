import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncRetryer } from '@tanstack/react-pacer/async-retryer'

interface UserData {
  id: number
  name: string
  email: string
}

// Simulate API call with fake data that fails randomly
const fakeApi = async (userId: string): Promise<UserData> => {
  await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay

  // Randomly fail 60% of the time to demonstrate retry functionality
  if (Math.random() < 0.6) {
    throw new Error(`Network error fetching user ${userId}`)
  }

  return {
    id: parseInt(userId),
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
  }
}

function App() {
  const [userId, setUserId] = useState('123')
  const [userData, setUserData] = useState<UserData | null>(null)

  // The function that will be retried
  const fetchUser = async (id: string) => {
    const data = await fakeApi(id)
    setUserData(data)
    return data
  }

  // hook that gives you an async retryer instance
  const asyncRetryer = useAsyncRetryer(
    fetchUser,
    {
      maxAttempts: 5, // Retry up to 5 times
      backoff: 'exponential', // Exponential backoff (1s, 2s, 4s, 8s, 16s)
      baseWait: 1000, // Start with 1 second wait
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt} after error:`, error)
      },
      onError: (error) => {
        console.error('Request failed:', error)
      },
      onLastError: (error) => {
        console.error('All retries failed:', error)
        setUserData(null)
      },
      onSuccess: (result) => {
        console.log('Request succeeded:', result)
      },
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      isExecuting: state.isExecuting,
      currentAttempt: state.currentAttempt,
      executionCount: state.executionCount,
      lastError: state.lastError,
      status: state.status,
    }),
  )

  // get and name our retry function
  const handleFetchUser = asyncRetryer.execute

  // event handler that calls the retry function
  async function onFetchUser() {
    const result = await handleFetchUser(userId) // optionally await result if you need to
    console.log('Final result:', result)
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncRetryer Example</h1>
      <div>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID..."
          style={{ marginRight: '10px' }}
        />
        <button onClick={onFetchUser} disabled={asyncRetryer.state.isExecuting}>
          {asyncRetryer.state.isExecuting ? 'Fetching...' : 'Fetch User'}
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => asyncRetryer.abort()}>Cancel</button>
        <button
          onClick={() => asyncRetryer.reset()}
          style={{ marginLeft: '10px' }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>
          <strong>Status:</strong> {asyncRetryer.state.status}
        </p>
        {asyncRetryer.state.currentAttempt > 0 && (
          <p>
            <strong>Current Attempt:</strong>{' '}
            {asyncRetryer.state.currentAttempt}
          </p>
        )}
        <p>
          <strong>Total Executions:</strong> {asyncRetryer.state.executionCount}
        </p>
        {asyncRetryer.state.lastError && (
          <p style={{ color: 'red' }}>
            <strong>Last Error:</strong> {asyncRetryer.state.lastError.message}
          </p>
        )}
      </div>

      {userData && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            border: '1px solid #ccc',
          }}
        >
          <h3>User Data:</h3>
          <p>
            <strong>ID:</strong> {userData.id}
          </p>
          <p>
            <strong>Name:</strong> {userData.name}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
        </div>
      )}

      <pre
        style={{
          marginTop: '20px',
          backgroundColor: '#f5f5f5',
          padding: '10px',
        }}
      >
        {JSON.stringify(asyncRetryer.store.state, null, 2)}
      </pre>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)

let mounted = true
root.render(<App />)

// demo unmounting and cancellation
document.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.key === 'Enter') {
    mounted = !mounted
    root.render(mounted ? <App /> : null)
  }
})
