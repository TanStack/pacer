<script lang="ts">
  import { queue } from '@tanstack/svelte-pacer/queuer'

  let queueItems = $state<Array<number>>([])

  let processedCount = $state(0)

  let currentValue = $state(50)

  let queuedValue = $state(50)

  function processQueueItem(item: number) {
    queuedValue = item
  }

  // Create the simplified queuer function
  const queueValue = queue<number>(processQueueItem, {
    key: 'Range Change Queue',
    maxSize: 100,
    wait: 100,
    onItemsChange: (queue) => {
      queueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      processedCount = queue.store.state.executionCount
    },
  })

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    queueValue(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer queue Example 3</h1>
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
      >Queued Range (Readonly):<input
        type="range"
        min="0"
        max="100"
        value={queuedValue}
        disabled
        style="width: 100%"
      /><span>{queuedValue}</span></label
    >
  </div>
  <table>
    <tbody
      ><tr><td>Queue Size:</td><td>{queueItems.length}</td></tr><tr
        ><td>Items Processed:</td><td>{processedCount}</td></tr
      ><tr><td>Queue Items:</td><td>{queueItems.join(', ')}</td></tr></tbody
    >
  </table>
</div>
