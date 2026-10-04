<script lang="ts">
  import { createAsyncThrottler } from '@tanstack/svelte-pacer/async-throttler'
  let count = $state(0)

  let apiCallCount = $state(0)

  // Simulate API call that returns a value
  const incrementApi = async (value: number): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newCount = value + 1
    apiCallCount = apiCallCount + 1
    return newCount
  }

  const throttledIncrement = createAsyncThrottler(
    async (currentValue: number) => {
      const result = await incrementApi(currentValue)
      count = result
      return result
    },
    () => ({
      wait: 1000,
      leading: true, // Execute immediately on first call
      trailing: true, // Execute after throttle period ends
    }),
  ).maybeExecute

  function handleIncrement() {
    // Update local state immediately for instant feedback
    count = ((prev) => {
      const newCount = prev + 1
      throttledIncrement(newCount)
      return newCount
    })(count)
  }
</script>

<div>
  <h1>TanStack Pacer createAsyncThrottler Example 2</h1>
  <table>
    <tbody
      ><tr><td>Current Count:</td><td>{count}</td></tr><tr
        ><td>API Calls Made:</td><td>{apiCallCount}</td></tr
      ></tbody
    >
  </table>
  <div>
    <button onclick={handleIncrement}>Increment (throttled API call)</button>
  </div>
  <p style="font-size: 0.9em; color: #666">
    Click rapidly - API calls are throttled to 1 second, but UI updates
    immediately. First click executes immediately, then at most once per second.
  </p>
</div>
