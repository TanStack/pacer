<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import {
    rateLimiterOptions,
    createRateLimiter,
  } from '@tanstack/svelte-pacer/rate-limiter'

  const counterCommonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let instantCount = $state(0)

  let limitedCount = $state(0)

  const counterRateLimiter = createRateLimiter(
    (value: typeof limitedCount) => {
      limitedCount = value
    },
    () => ({
      key: 'counter',
      // enabled: () => instantCount > 2,
      ...counterCommonRateLimiterOptions,
      windowType: windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function increment() {
    const nextCount = ++instantCount
    counterRateLimiter.maybeExecute(nextCount)
  }
  // Selected counters invalidate these imperative window readouts.
  function counterReadWindow(_executionCount: number, _rejectionCount: number) {
    return {
      remaining: counterRateLimiter.getRemainingInWindow(),
      milliseconds: counterRateLimiter.getMsUntilNextWindow(),
    }
  }

  let currentValue = $state(50)

  let limitedValue = $state(50)

  let instantExecutionCount = $state(0)

  const rangeRateLimiter = createRateLimiter(
    (value: typeof limitedValue) => {
      limitedValue = value
    },
    () => ({
      key: 'range',
      limit: 20,
      window: 2000,
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
    instantExecutionCount = instantExecutionCount + 1
    rangeRateLimiter.maybeExecute(newValue)
  }
  // Selected counters invalidate these imperative window readouts.
  function rangeReadWindow(_executionCount: number, _rejectionCount: number) {
    return {
      remaining: rangeRateLimiter.getRemainingInWindow(),
      milliseconds: rangeRateLimiter.getMsUntilNextWindow(),
    }
  }

  const searchCommonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  let instantSearch = $state('')

  let limitedSearch = $state('')

  const searchRateLimiter = createRateLimiter(
    (value: typeof limitedSearch) => {
      limitedSearch = value
    },
    () => ({
      key: 'search',
      enabled: () => instantSearch.length > 2, // optional, defaults to true
      ...searchCommonRateLimiterOptions,
      // windowType: 'sliding', // default is 'fixed'
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    instantSearch = newValue
    searchRateLimiter.maybeExecute(newValue)
  }
  // Selected counters invalidate these imperative window readouts.
  function searchReadWindow(_executionCount: number, _rejectionCount: number) {
    return {
      remaining: searchRateLimiter.getRemainingInWindow(),
      milliseconds: searchRateLimiter.getMsUntilNextWindow(),
    }
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createRateLimiter Example 1</h1>
    <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
      <label
        ><input
          type="radio"
          name="windowType"
          value="fixed"
          checked={windowType === 'fixed'}
          oninput={() => (windowType = 'fixed')}
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType"
          value="sliding"
          checked={windowType === 'sliding'}
          oninput={() => (windowType = 'sliding')}
        />Sliding Window</label
      >
    </div>
    <table>
      <tbody
        ><counterRateLimiter.Subscribe
          selector={(state) => ({
            executionCount: state.executionCount,
            rejectionCount: state.rejectionCount,
          })}
          >{#snippet children({ executionCount, rejectionCount })}<tr
              ><td>Execution Count:</td><td>{executionCount}</td></tr
            ><tr><td>Rejection Count:</td><td>{rejectionCount}</td></tr><tr
              ><td>Remaining in Window:</td><td
                >{counterReadWindow(executionCount, rejectionCount)
                  .remaining}</td
              ></tr
            ><tr
              ><td>Ms Until Next Window:</td><td
                >{counterReadWindow(executionCount, rejectionCount)
                  .milliseconds}</td
              ></tr
            ><tr><td colspan={2}><hr /></td></tr><tr
              ><td>Instant Count:</td><td>{instantCount}</td></tr
            ><tr><td>Rate Limited Count:</td><td>{limitedCount}</td></tr
            >{/snippet}</counterRateLimiter.Subscribe
        ></tbody
      >
    </table>
    <div>
      <button onclick={increment}>Increment</button><button
        onclick={() => counterRateLimiter.reset()}>Reset</button
      >
    </div>
    <counterRateLimiter.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</counterRateLimiter.Subscribe
    >
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createRateLimiter Example 2</h1>
    <div>
      <!-- svelte-ignore a11y_autofocus: Focus the search field in this standalone demo. -->
      <input
        autofocus
        type="search"
        value={instantSearch}
        oninput={handleSearchChange}
        placeholder="Type to search..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody
        ><searchRateLimiter.Subscribe
          selector={(state) => ({
            executionCount: state.executionCount,
            rejectionCount: state.rejectionCount,
          })}
          >{#snippet children({ executionCount, rejectionCount })}<tr
              ><td>Execution Count:</td><td>{executionCount}</td></tr
            ><tr><td>Rejection Count:</td><td>{rejectionCount}</td></tr><tr
              ><td>Remaining in Window:</td><td
                >{searchReadWindow(executionCount, rejectionCount)
                  .remaining}</td
              ></tr
            ><tr
              ><td>Ms Until Next Window:</td><td
                >{searchReadWindow(executionCount, rejectionCount)
                  .milliseconds}</td
              ></tr
            ><tr><td colspan={2}><hr /></td></tr><tr
              ><td>Instant Search:</td><td>{instantSearch}</td></tr
            ><tr><td>Rate Limited Search:</td><td>{limitedSearch}</td></tr
            >{/snippet}</searchRateLimiter.Subscribe
        ></tbody
      >
    </table>
    <div><button onclick={() => searchRateLimiter.reset()}>Reset</button></div>
    <searchRateLimiter.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</searchRateLimiter.Subscribe
    >
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createRateLimiter Example 3</h1>
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
    <table>
      <tbody
        ><rangeRateLimiter.Subscribe
          selector={(state) => ({
            executionCount: state.executionCount,
            rejectionCount: state.rejectionCount,
          })}
          >{#snippet children({ executionCount, rejectionCount })}<tr
              ><td>Execution Count:</td><td>{executionCount}</td></tr
            ><tr><td>Rejection Count:</td><td>{rejectionCount}</td></tr><tr
              ><td>Remaining in Window:</td><td
                >{rangeReadWindow(executionCount, rejectionCount).remaining}</td
              ></tr
            ><tr
              ><td>Ms Until Next Window:</td><td
                >{rangeReadWindow(executionCount, rejectionCount)
                  .milliseconds}</td
              ></tr
            ><tr
              ><td>Instant Executions:</td><td>{instantExecutionCount}</td></tr
            ><tr
              ><td>Saved Executions:</td><td
                >{instantExecutionCount - executionCount}</td
              ></tr
            ><tr
              ><td>% Reduction:</td><td
                >{#if instantExecutionCount === 0}{'0'}{:else}{Math.round(
                    ((instantExecutionCount - executionCount) /
                      instantExecutionCount) *
                      100,
                  )}{/if}%
              </td></tr
            >{/snippet}</rangeRateLimiter.Subscribe
        ></tbody
      >
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Rate limited to 20 updates per 2 seconds</p>
    </div>
    <rangeRateLimiter.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</rangeRateLimiter.Subscribe
    >
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
