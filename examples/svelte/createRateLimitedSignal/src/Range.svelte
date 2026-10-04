<script lang="ts">
  import { untrack } from 'svelte'

  import { createRateLimitedSignal } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let currentValue = $state(50)

  let instantExecutionCount = $state(0)

  const [limitedValue, setLimitedValue, rateLimiter] = createRateLimitedSignal(
    untrack(() => currentValue),
    () => ({
      limit: 20,
      window: 2000,
      windowType: windowType,
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
      remaining: rateLimiter.getRemainingInWindow(),
      milliseconds: rateLimiter.getMsUntilNextWindow(),
    }
  }
</script>

<div>
  <h1>TanStack Pacer createRateLimitedSignal Example 3</h1>
  <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
    <label
      ><input
        type="radio"
        name="windowType3"
        value="fixed"
        checked={windowType === 'fixed'}
        oninput={() => (windowType = 'fixed')}
      />Fixed Window</label
    ><label
      ><input
        type="radio"
        name="windowType3"
        value="sliding"
        checked={windowType === 'sliding'}
        oninput={() => (windowType = 'sliding')}
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
      ><rateLimiter.Subscribe
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
          ><tr><td>Instant Executions:</td><td>{instantExecutionCount}</td></tr
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
          >{/snippet}</rateLimiter.Subscribe
      ></tbody
    >
  </table>
  <div style="color: #666; font-size: 0.9em">
    <p>Rate limited to 20 updates per 2 seconds</p>
  </div>
  <rateLimiter.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</rateLimiter.Subscribe
  >
</div>
