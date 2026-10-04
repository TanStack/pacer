<script lang="ts">
  import { queue } from '@tanstack/svelte-pacer/queuer'

  let queueItems = $state<Array<number>>([])

  let processedCount = $state(0)

  function processQueueItem(item: number) {
    console.log('Processing item:', item)
  }

  // Create the simplified queuer function
  const queueItem = queue<number>(processQueueItem, {
    key: 'Add Number Queue',
    maxSize: 25,
    wait: 1000,
    onItemsChange: (queue) => {
      queueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      processedCount = queue.store.state.executionCount
    },
  })
</script>

<div>
  <h1>TanStack Pacer queue Example 1</h1>
  <table>
    <tbody
      ><tr><td>Queue Size:</td><td>{queueItems.length}</td></tr><tr
        ><td>Items Processed:</td><td>{processedCount}</td></tr
      ><tr><td>Queue Items:</td><td>{queueItems.join(', ')}</td></tr></tbody
    >
  </table>
  <button
    onclick={() => {
      const nextNumber = queueItems.length
        ? queueItems[queueItems.length - 1]! + 1
        : 1
      queueItem(nextNumber)
    }}
    disabled={queueItems.length >= 25}
  >
    Add Number
  </button>
</div>
