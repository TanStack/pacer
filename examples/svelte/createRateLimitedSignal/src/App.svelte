<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { untrack } from 'svelte'
  import { createRateLimitedSignal } from '@tanstack/svelte-pacer/rate-limiter'

  const counterAlert = window.alert.bind(window)

  let counterWindowType = $state<'fixed' | 'sliding'>('fixed')

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  const [limitedCount, setLimitedCount, counterRateLimiter] =
    createRateLimitedSignal(
      untrack(() => instantCount),
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
    const nextCount = ++instantCountRef
    instantCount = nextCount
    setLimitedCount(nextCount)
  }

  let rangeWindowType = $state<'fixed' | 'sliding'>('fixed')

  let currentValue = $state(50)

  let instantExecutionCount = $state(0)

  const [limitedValue, setLimitedValue, rangeRateLimiter] =
    createRateLimitedSignal(
      untrack(() => currentValue),
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
    instantExecutionCount = instantExecutionCount + 1
    setLimitedValue(newValue)
  }
  // Reading selected counters refreshes the imperative window queries.
  function readWindow(_executionCount: number, _rejectionCount: number) {
    return {
      remaining: rangeRateLimiter.getRemainingInWindow(),
      milliseconds: rangeRateLimiter.getMsUntilNextWindow(),
    }
  }

  const searchAlert = window.alert.bind(window)

  let searchWindowType = $state<'fixed' | 'sliding'>('fixed')

  let instantSearch = $state('')

  const [limitedSearch, setLimitedSearch, searchRateLimiter] =
    createRateLimitedSignal(
      untrack(() => instantSearch),
      () => ({
        // enabled: () => instantSearch.length > 2, // optional, defaults to true
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
    const newValue = (e.target as HTMLInputElement).value

    instantSearch = newValue
    setLimitedSearch(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createRateLimitedSignal Example 1</h1>
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
        ><counterRateLimiter.Subscribe
          selector={(state) => ({
            executionCount: state.executionCount,
            rejectionCount: state.rejectionCount,
          })}
          >{#snippet children({ executionCount, rejectionCount })}<tr
              ><td>Execution Count:</td><td>{executionCount}</td></tr
            ><tr><td>Rejection Count:</td><td>{rejectionCount}</td></tr><tr
              ><td>Instant Count:</td><td>{instantCount}</td></tr
            ><tr><td>Rate Limited Count:</td><td>{limitedCount()}</td></tr
            >{/snippet}</counterRateLimiter.Subscribe
        ></tbody
      >
    </table>
    <div>
      <button onclick={increment}>Increment</button><button
        onclick={() => counterAlert(counterRateLimiter.getRemainingInWindow())}
      >
        Remaining in Window</button
      ><button onclick={() => counterAlert(counterRateLimiter.reset())}
        >Reset</button
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
    <h1>TanStack Pacer createRateLimitedSignal Example 2</h1>
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
        ><searchRateLimiter.Subscribe
          selector={(state) => ({
            executionCount: state.executionCount,
            rejectionCount: state.rejectionCount,
          })}
          >{#snippet children({ executionCount, rejectionCount })}<tr
              ><td>Execution Count:</td><td>{executionCount}</td></tr
            ><tr><td>Rejection Count:</td><td>{rejectionCount}</td></tr><tr
              ><td>Instant Search:</td><td>{instantSearch}</td></tr
            ><tr><td>Rate Limited Search:</td><td>{limitedSearch()}</td></tr
            >{/snippet}</searchRateLimiter.Subscribe
        ></tbody
      >
    </table>
    <div>
      <button
        onclick={() => searchAlert(searchRateLimiter.getRemainingInWindow())}
      >
        Remaining in Window</button
      ><button onclick={() => searchAlert(searchRateLimiter.reset())}
        >Reset</button
      >
    </div>
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
    <h1>TanStack Pacer createRateLimitedSignal Example 3</h1>
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
                >{readWindow(executionCount, rejectionCount).remaining}</td
              ></tr
            ><tr
              ><td>Ms Until Next Window:</td><td
                >{readWindow(executionCount, rejectionCount).milliseconds}</td
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
