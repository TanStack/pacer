<script lang="ts">
  import { createAsyncDebouncer } from '@tanstack/svelte-pacer/async-debouncer'
  let count = $state(0)

  let apiCallCount = $state(0)

  // Simulate API call that returns a value
  const incrementApi = async (value: number): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newCount = value + 1
    apiCallCount = apiCallCount + 1
    return newCount
  }

  const debouncedIncrement = createAsyncDebouncer(
    async (currentValue: number) => {
      const result = await incrementApi(currentValue)
      count = result
      return result
    },
    () => ({
      wait: 1000,
      leading: false, // Don't execute immediately
      trailing: true, // Execute after delay
    }),
  ).maybeExecute

  function handleIncrement() {
    // Update local state immediately for instant feedback
    const newCount = count + 1
    count = newCount
    // Debounced API call
    debouncedIncrement(newCount)
  }
</script>

<div>
  <h1>TanStack Pacer createAsyncDebouncer Example 2</h1>
  <table>
    <tbody
      ><tr><td>Current Count:</td><td>{count}</td></tr><tr
        ><td>API Calls Made:</td><td>{apiCallCount}</td></tr
      ></tbody
    >
  </table>
  <div>
    <button onclick={handleIncrement}>Increment (debounced API call)</button>
  </div>
  <p style="font-size: 0.9em; color: #666">
    Click rapidly - API calls are debounced to 1 second, but UI updates
    immediately
  </p>
</div>
