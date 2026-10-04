<script lang="ts">
  import { createQueuedValue } from '@tanstack/svelte-pacer/queuer'

  let instantSearchValue = $state('')

  const [value, queuer] = createQueuedValue(
    () => instantSearchValue,
    () => ({
      maxSize: 25,
      wait: 500, // wait 500ms between processing value changes
    }),
  )
</script>

<div>
  <h1>TanStack Pacer createQueuedValue Example 1</h1>
  <div>Current Value: {value()}</div>
  <hr />
  <queuer.Subscribe
    selector={(state) => ({
      items: state.items,
      size: state.size,
      isFull: state.isFull,
      isEmpty: state.isEmpty,
      isIdle: state.isIdle,
      status: state.status,
      executionCount: state.executionCount,
      isRunning: state.isRunning,
    })}
    >{#snippet children({
      items,
      size,
      isFull,
      isEmpty,
      isIdle,
      status,
      executionCount,
      isRunning,
    })}<div>Queue Size: {size}</div>
      <div>Queue Full: {isFull ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {items[0]}</div>
      <div>Queue Empty: {isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {status}</div>
      <div>Items Processed: {executionCount}</div>
      <div>Queue Items: {items.join(', ')}</div>
      <div
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0"
      >
        <input
          type="search"
          value={instantSearchValue}
          oninput={(e) => {
            instantSearchValue = (e.target as HTMLInputElement).value // instantly update the local search value
          }}
          placeholder="Enter search term..."
          disabled={isFull}
        /><button
          disabled={isEmpty}
          onclick={() => {
            queuer.execute()
          }}
        >
          Process Next</button
        ><button onclick={() => queuer.clear()} disabled={isEmpty}>
          Clear Queue</button
        ><button onclick={() => queuer.reset()} disabled={isEmpty}>
          Reset Queue</button
        ><button onclick={() => queuer.start()} disabled={isRunning}>
          Start Processing</button
        ><button onclick={() => queuer.stop()} disabled={!isRunning}>
          Stop Processing
        </button>
      </div>{/snippet}</queuer.Subscribe
  >
  <pre style="margin-top: 20px"><queuer.Subscribe selector={(state) => state}
      >{#snippet children(state)}{JSON.stringify(
          state,
          null,
          2,
        )}{/snippet}</queuer.Subscribe
    ></pre>
</div>
