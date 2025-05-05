import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { asyncDebounce } from '@tanstack/solid-pacer/async-debouncer'

function SearchApp() {
  const [searchText, setSearchText] = createSignal('')
  const [debouncedSearchText, setDebouncedSearchText] = createSignal('')
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

  const debouncedSetSearch = asyncDebounce(
    async (value: string) => {
      try {
        setLoading(true)
        setDebouncedSearchText(value)
        const results = await simulateSearch(value)
        setSearchResults(results)
      } catch (err) {
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    },
    {
      wait: 500,
    },
  )

  return (
    <div>
      <h1>TanStack Pacer asyncDebounce Example</h1>
      <div>
        <input
          autofocus
          type="search"
          value={searchText()}
          onInput={(e) => {
            const target = e.target as HTMLInputElement
            const newValue = target.value
            setSearchText(newValue)
            debouncedSetSearch(newValue)
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
            <td>Debounced Search:</td>
            <td>{debouncedSearchText()}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <h3>Search Results:</h3>
        <For each={searchResults()}>{(result) => <li>{result}</li>}</For>
      </div>
    </div>
  )
}

render(() => <SearchApp />, document.getElementById('root')!)
