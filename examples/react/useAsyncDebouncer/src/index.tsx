import { scan } from 'react-scan' // dev-tools for demo
import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncDebouncer } from '@tanstack/react-bouncer/async-debouncer'

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

  const handleSearch = async (term: string) => {
    if (!term) {
      setResults([])
      return
    }

    if (!results.length) {
      setIsLoading(true)
    }

    try {
      const data = await fakeApi(term)
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
    console.log(setSearchAsyncDebouncer.getExecutionCount())
  }

  const setSearchAsyncDebouncer = useAsyncDebouncer(handleSearch, {
    wait: 500, // Wait 500ms between API calls
  })

  const handleSearchDebounced = setSearchAsyncDebouncer.maybeExecute

  useEffect(() => {
    console.log('mount')
    return () => {
      console.log('unmount')
      setSearchAsyncDebouncer.cancel() // cancel any pending async calls when the component unmounts
    }
  }, [])

  function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTerm = e.target.value
    setSearchTerm(newTerm)
    handleSearchDebounced(newTerm)
  }

  return (
    <div>
      <h1>TanStack Bouncer useAsyncDebouncer Example</h1>
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
          autoComplete="new-password"
        />
      </div>
      <div>
        <p>API calls made: {setSearchAsyncDebouncer.getExecutionCount()}</p>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {results.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)

let mounted = true
root.render(<App />)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    mounted = !mounted
    root.render(mounted ? <App /> : null)
  }
})

scan() // dev-tools for demo
