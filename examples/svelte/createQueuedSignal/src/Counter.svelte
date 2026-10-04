<script lang="ts">
  import { createQueuedSignal } from '@tanstack/svelte-pacer/queuer'

  // Select the pending queue items as reactive state.
  function processItem(item: number) {
    console.log('processing item', item)
  }

  const [queueItems, addItem, queuer] = createQueuedSignal(
    processItem,
    () => ({
      maxSize: 25,
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      started: false,
      wait: 1000, // wait 1 second between processing items - wait is optional!
    }),
    (state) => ({ items: state.items }),
  )
</script>

<div>
  <h1>TanStack Pacer createQueuedSignal Example 1</h1>
  <queuer.Subscribe
    selector={(state) => ({
      size: state.size,
      isFull: state.isFull,
      isEmpty: state.isEmpty,
      isIdle: state.isIdle,
      status: state.status,
      executionCount: state.executionCount,
      isRunning: state.isRunning,
    })}
    >{#snippet children({
      size,
      isFull,
      isEmpty,
      isIdle,
      status,
      executionCount,
      isRunning,
    })}<div>Queue Size: {size}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {isFull ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queueItems()[0]}</div>
      <div>Queue Empty: {isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {status}</div>
      <div>Items Processed: {executionCount}</div>
      <div>Queue Items: {queueItems().join(', ')}</div>
      <div
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0"
      >
        <button
          onclick={() => {
            const nextNumber = queueItems().length
              ? queueItems()[queueItems().length - 1]! + 1
              : 1
            addItem(nextNumber)
          }}
          disabled={isFull}
        >
          Add Number</button
        ><button
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
  ><queuer.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</queuer.Subscribe
  >
</div>
