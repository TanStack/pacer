import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createDebouncedValue } from '@tanstack/solid-pacer/debouncer'

function App1() {
  const [instantCount, setInstantCount] = createSignal(0)

  function increment() {
    setInstantCount((c) => c + 1)
  }

  // highest-level hook that watches an instant local state value and returns a debounced value
  const [debouncedCount] = createDebouncedValue(instantCount, {
    wait: 500,
    // leading: true, // optional, defaults to false
  })

  return (
    <div>
      <h1>TanStack Pacer createDebouncedValue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>Debounced Count:</td>
            <td>{debouncedCount()}</td>
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
  const [instantSearch, setInstantSearch] = createSignal('')

  // highest-level hook that watches an instant local state value and returns a debounced value
  const [debouncedSearch] = createDebouncedValue(instantSearch, {
    wait: 500,
  })

  function handleSearchChange(e: Event) {
    setInstantSearch((e.target as HTMLInputElement).value)
  }

  return (
    <div>
      <h1>TanStack Pacer createDebouncedValue Example 2</h1>
      <div>
        <input
          autofocus
          type="search"
          value={instantSearch()}
          onInput={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>{instantSearch()}</td>
          </tr>
          <tr>
            <td>Debounced Search:</td>
            <td>{debouncedSearch()}</td>
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
