<script lang="ts">
  import { createQueuer } from '@tanstack/svelte-pacer/queuer'

  // The function that we will be queuing
  function processItem(item: number) {
    console.log('processing item', item)
  }

  const queuer = createQueuer(processItem, () => ({
    key: 'Add Number Queue',
    initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    maxSize: 25, // optional, defaults to Infinity
    started: false, // optional, defaults to true
    wait: 1000, // wait 1 second between processing items - wait is optional!
  }))
</script>

<div>
  <h1>TanStack Pacer createQueuer Example 1</h1>
  <queuer.Subscribe
    selector={(state) => ({
      size: state.size,
      isFull: state.isFull,
      isEmpty: state.isEmpty,
      isIdle: state.isIdle,
      isRunning: state.isRunning,
      status: state.status,
      executionCount: state.executionCount,
      items: state.items,
    })}
    >{#snippet children({
      size,
      isFull,
      isEmpty,
      isIdle,
      isRunning,
      status,
      executionCount,
      items,
    })}<div>Queue Size: {size}</div>
      <div>Queue Max Size: {25}</div>
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
        <button
          onclick={() => {
            const nextNumber = items.length ? items[items.length - 1]! + 1 : 1
            queuer.addItem(nextNumber)
          }}
          disabled={isFull}
        >
          Add Number</button
        ><button
          disabled={isEmpty}
          onclick={() => {
            const item = queuer.execute()
            console.log('getNextItem item', item)
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
          Stop Processing</button
        ><button onclick={() => queuer.flush()} disabled={isEmpty}>
          Flush Queue
        </button>
      </div>{/snippet}</queuer.Subscribe
  ><queuer.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</queuer.Subscribe
  >
</div>
