<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createAsyncQueuer } from '@tanstack/svelte-pacer/async-queuer'

  const fakeWaitTime = 500
  type Item = number
  let concurrency = $state(2)

  // The function to process each item (now a number)
  async function processItem(item: Item): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, fakeWaitTime))
    console.log(`Processed ${item}`)
  }

  const asyncQueuer = createAsyncQueuer(processItem, () => ({
    key: 'createAsyncQueuer',
    maxSize: 25,
    initialItems: Array.from({ length: 10 }, (_, i) => i + 1),
    concurrency: concurrency, // Process 2 items concurrently
    started: false,
    wait: 100, // for demo purposes - usually you would not want extra wait time if you are also throttling with concurrency
    onReject: (item, asyncQueuer) => {
      console.log(
        'Queue is full, rejecting item',
        item,
        asyncQueuer.store.state.rejectionCount,
      )
    },
    onError: (error, item: Item, asyncQueuer) => {
      console.error(
        `Error processing item: ${item}`,
        error,
        asyncQueuer.store.state.errorCount,
      ) // optionally, handle errors here instead of your own try/catch
    },
  }))
</script>

<div>
  <h1>TanStack Pacer createAsyncQueuer Example</h1>
  <asyncQueuer.Subscribe
    selector={(state) => ({
      size: state.size,
      isFull: state.isFull,
      isEmpty: state.isEmpty,
      isIdle: state.isIdle,
      status: state.status,
      successCount: state.successCount,
      rejectionCount: state.rejectionCount,
      activeItems: state.activeItems,
      items: state.items,
      isRunning: state.isRunning,
    })}
    >{#snippet children({
      size,
      isFull,
      isEmpty,
      isIdle,
      status,
      successCount,
      rejectionCount,
      activeItems,
      items,
      isRunning,
    })}<div></div>
      <div>Queue Size: {size}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {isFull ? 'Yes' : 'No'}</div>
      <div>Queue Empty: {isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {status}</div>
      <div>Items Processed: {successCount}</div>
      <div>Items Rejected: {rejectionCount}</div>
      <div>Active Tasks: {activeItems.length}</div>
      <div>Pending Tasks: {items.length}</div>
      <div>
        Concurrency:{' '}<input
          type="number"
          min={1}
          value={concurrency}
          oninput={(e) =>
            (concurrency = Math.max(
              1,
              parseInt((e.target as HTMLInputElement).value) || 1,
            ))}
          style="width: 60px"
        />
      </div>
      <div style="min-height: 250px">
        Queue Items:{#each items as item, index (index)}<div>
            {index}: {item}
          </div>{/each}
      </div>
      <div
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0"
      >
        <button
          onclick={() => {
            const nextNumber = asyncQueuer.peekAllItems().length
              ? Math.max(...asyncQueuer.peekAllItems()) + 1
              : 1
            asyncQueuer.addItem(nextNumber)
          }}
          disabled={isFull}
        >
          Add Async Task</button
        ><button onclick={() => asyncQueuer.getNextItem()}>Get Next Item</button
        ><button onclick={() => asyncQueuer.clear()} disabled={isEmpty}>
          Clear Queue</button
        ><button onclick={() => asyncQueuer.flush()} disabled={isEmpty}>
          Flush Queue</button
        ><button onclick={() => asyncQueuer.start()} disabled={isRunning}>
          Start Processing</button
        ><button onclick={() => asyncQueuer.stop()} disabled={!isRunning}>
          Stop Processing</button
        ><button onclick={() => asyncQueuer.reset()}>Reset Queue</button>
      </div>{/snippet}</asyncQueuer.Subscribe
  ><asyncQueuer.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</asyncQueuer.Subscribe
  >
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
