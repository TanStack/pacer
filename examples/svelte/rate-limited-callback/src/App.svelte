<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createRateLimiter } from '@tanstack/svelte-pacer/rate-limiter'

  let counterWindowType = $state<'fixed' | 'sliding'>('fixed')

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  let rateLimitedCount = $state(0)

  const rateLimitedSetCount = createRateLimiter(
    (value: typeof rateLimitedCount) => {
      rateLimitedCount = value
    },
    () => ({
      limit: 5,
      window: 5000,
      windowType: counterWindowType,
      enabled: () => instantCountRef > 2,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    }),
  ).maybeExecute

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    rateLimitedSetCount(nextCount)
  }

  let rangeWindowType = $state<'fixed' | 'sliding'>('fixed')

  let currentValue = $state(50)

  let limitedValue = $state(50)

  const rateLimitedSetValue = createRateLimiter(
    (value: typeof limitedValue) => {
      limitedValue = value
    },
    () => ({
      limit: 20,
      window: 2000,
      windowType: rangeWindowType,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    }),
  ).maybeExecute

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    rateLimitedSetValue(newValue)
  }

  let searchWindowType = $state<'fixed' | 'sliding'>('fixed')

  let searchText = $state('')

  let searchTextRef = $state('')

  let rateLimitedSearchText = $state('')

  const rateLimitedSetSearch = createRateLimiter(
    (value: typeof rateLimitedSearchText) => {
      rateLimitedSearchText = value
    },
    () => ({
      limit: 5,
      window: 5000,
      windowType: searchWindowType,
      enabled: () => searchTextRef.length > 2,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    }),
  ).maybeExecute

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchTextRef = newValue
    searchText = newValue
    rateLimitedSetSearch(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createRateLimiter Example 1</h1>
    <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
      <label
        ><input
          type="radio"
          name="counterWindowType"
          value="fixed"
          checked={counterWindowType === 'fixed'}
          oninput={() => (counterWindowType = 'fixed')}
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="counterWindowType"
          value="sliding"
          checked={counterWindowType === 'sliding'}
          oninput={() => (counterWindowType = 'sliding')}
        />Sliding Window</label
      >
    </div>
    <table>
      <tbody
        ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
          ><td>RateLimited Count:</td><td>{rateLimitedCount}</td></tr
        ></tbody
      >
    </table>
    <div><button onclick={increment}>Increment</button></div>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createRateLimiter Example 2</h1>
    <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
      <label
        ><input
          type="radio"
          name="windowType2"
          value="fixed"
          checked={searchWindowType === 'fixed'}
          oninput={() => (searchWindowType = 'fixed')}
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType2"
          value="sliding"
          checked={searchWindowType === 'sliding'}
          oninput={() => (searchWindowType = 'sliding')}
        />Sliding Window</label
      >
    </div>
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
          ><td>RateLimited Search:</td><td>{rateLimitedSearchText}</td></tr
        ></tbody
      >
    </table>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createRateLimiter Example 3</h1>
    <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
      <label
        ><input
          type="radio"
          name="windowType3"
          value="fixed"
          checked={rangeWindowType === 'fixed'}
          oninput={() => (rangeWindowType = 'fixed')}
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType3"
          value="sliding"
          checked={rangeWindowType === 'sliding'}
          oninput={() => (rangeWindowType = 'sliding')}
        />Sliding Window</label
      >
    </div>
    <div style="margin-bottom: 20px">
      <label
        >Current Range:<input
          type="range"
          min="0"
          max="100"
          value={currentValue}
          oninput={handleRangeChange}
          style="width: 100%"
        /><span>{currentValue}</span></label
      >
    </div>
    <div style="margin-bottom: 20px">
      <label
        >Rate Limited Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          value={limitedValue}
          disabled
          style="width: 100%"
        /><span>{limitedValue}</span></label
      >
    </div>
    <div style="color: #666; font-size: 0.9em">
      <p>Rate limited to 20 updates per 2 seconds</p>
    </div>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
