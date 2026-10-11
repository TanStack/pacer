<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createRateLimitedValue } from '@tanstack/svelte-pacer/rate-limiter'

  let counterWindowType = $state<'fixed' | 'sliding'>('fixed')

  let instantCount = $state(0)

  const [limitedCount] = createRateLimitedValue(
    () => instantCount,
    () => ({
      // enabled: () => instantCount > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      windowType: counterWindowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function increment() {
    instantCount = instantCount + 1
  }

  let rangeWindowType = $state<'fixed' | 'sliding'>('fixed')

  let currentValue = $state(50)

  let submittedCount = $state(1)

  const [limitedValue, rateLimiter] = createRateLimitedValue(
    () => currentValue,
    () => ({
      limit: 20,
      window: 2000,
      windowType: rangeWindowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    submittedCount = submittedCount + 1
  }
  // Reading selected counters refreshes the imperative window queries.
  function readWindow(_executionCount: number, _rejectionCount: number) {
    return {
      remaining: rateLimiter.getRemainingInWindow(),
      milliseconds: rateLimiter.getMsUntilNextWindow(),
    }
  }

  let searchWindowType = $state<'fixed' | 'sliding'>('fixed')

  let instantSearch = $state('')

  const [limitedSearch] = createRateLimitedValue(
    () => instantSearch,
    () => ({
      // enabled: instantSearch.length > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      windowType: searchWindowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function handleSearchChange(e: Event) {
    instantSearch = (e.target as HTMLInputElement).value
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createRateLimitedValue Example 1</h1>
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
          ><td>Rate Limited Count:</td><td>{limitedCount()}</td></tr
        ></tbody
      >
    </table>
    <div><button onclick={increment}>Increment</button></div>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createRateLimitedValue Example 2</h1>
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
        value={instantSearch}
        oninput={handleSearchChange}
        placeholder="Type to search..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody
        ><tr><td>Instant Search:</td><td>{instantSearch}</td></tr><tr
          ><td>Rate Limited Search:</td><td>{limitedSearch()}</td></tr
        ></tbody
      >
    </table>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createRateLimitedValue Example 3</h1>
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
          value={limitedValue()}
          disabled
          style="width: 100%"
        /><span>{limitedValue()}</span></label
      >
    </div>
    <rateLimiter.Subscribe
      selector={(state) => ({
        executionCount: state.executionCount,
        rejectionCount: state.rejectionCount,
      })}
      >{#snippet children({ executionCount, rejectionCount })}<table>
          <tbody
            ><tr><td>Execution Count:</td><td>{executionCount}</td></tr><tr
              ><td>Rejection Count:</td><td>{rejectionCount}</td></tr
            ><tr
              ><td>Remaining in Window:</td><td
                >{readWindow(executionCount, rejectionCount).remaining}</td
              ></tr
            ><tr
              ><td>Ms Until Next Window:</td><td
                >{readWindow(executionCount, rejectionCount).milliseconds}</td
              ></tr
            ><tr><td>Values Submitted:</td><td>{submittedCount}</td></tr><tr
              ><td>Saved Executions:</td><td
                >{submittedCount - executionCount}</td
              ></tr
            ><tr
              ><td>% Reduction:</td><td
                >{#if submittedCount === 0}{'0'}{:else}{Math.round(
                    ((submittedCount - executionCount) / submittedCount) * 100,
                  )}{/if}%
              </td></tr
            ></tbody
          >
        </table>
        <div style="color: #666; font-size: 0.9em">
          <p>Rate limited to 20 updates per 2 seconds</p>
        </div>{/snippet}</rateLimiter.Subscribe
    >
    <pre style="margin-top: 20px"><rateLimiter.Subscribe
        selector={(state) => state}
        >{#snippet children(state)}{JSON.stringify(
            state,
            null,
            2,
          )}{/snippet}</rateLimiter.Subscribe
      ></pre>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
