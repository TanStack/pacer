<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { debounce } from '@tanstack/svelte-pacer/debouncer'

  let instantCount = $state(0)

  let debouncedCount = $state(0)

  // Create debounced setter function - Stable reference required!
  const debouncedSetCount = debounce(
    (value: typeof debouncedCount) => (debouncedCount = value),
    {
      wait: 500,
      // leading: true, // optional, defaults to false
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      debouncedSetCount(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })(instantCount)
  }

  let instantValue = $state(50)

  let debouncedValue = $state(50)

  // Create debounced setter function - Stable reference required!
  const debouncedSetValue = debounce(
    (value: typeof debouncedValue) => (debouncedValue = value),
    {
      wait: 250,
    },
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    instantValue = newValue
    debouncedSetValue(newValue)
  }

  let searchText = $state('')

  let debouncedSearchText = $state('')

  // Create debounced setter function - Stable reference required!
  const debouncedSetSearch = debounce(
    (value: typeof debouncedSearchText) => (debouncedSearchText = value),
    {
      wait: 500,
    },
  )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchText = newValue
    debouncedSetSearch(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer debounce Example 1</h1>
    <table>
      <tbody
        ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
          ><td>Debounced Count:</td><td>{debouncedCount}</td></tr
        ></tbody
      >
    </table>
    <div><button onclick={increment}>Increment</button></div>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer debounce Example 2</h1>
    <div>
      <input
        type="search"
        value={searchText}
        oninput={handleSearchChange}
        placeholder="Type to search..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody
        ><tr><td>Instant Search:</td><td>{searchText}</td></tr><tr
          ><td>Debounced Search:</td><td>{debouncedSearchText}</td></tr
        ></tbody
      >
    </table>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer debounce Example 3</h1>
    <div style="margin-bottom: 20px">
      <label
        >Instant Range:<input
          type="range"
          min="0"
          max="100"
          value={instantValue}
          oninput={handleRangeChange}
          style="width: 100%"
        /><span>{instantValue}</span></label
      >
    </div>
    <div>
      <label
        >Debounced Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          value={debouncedValue}
          disabled
          style="width: 100%"
        /><span>{debouncedValue}</span></label
      >
    </div>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
