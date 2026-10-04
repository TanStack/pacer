<script lang="ts">
  import { queue } from '@tanstack/svelte-pacer/queuer'

  let queueItems = $state<Array<string>>([])

  let processedCount = $state(0)

  let inputText = $state('')

  let queuedText = $state('')

  function processQueueItem(item: string) {
    queuedText = item
  }

  // Create the simplified queuer function
  const queueTextChange = queue<string>(processQueueItem, {
    key: 'Text Change Queue',
    maxSize: 100,
    wait: 500,
    onItemsChange: (queue) => {
      queueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      processedCount = queue.store.state.executionCount
    },
  })

  function handleInputChange(e: Event) {
    inputText = (e.target as HTMLInputElement).value
    queueTextChange((e.target as HTMLInputElement).value)
  }
</script>

<div>
  <h1>TanStack Pacer queue Example 2</h1>
  <div>
    <input
      type="search"
      value={inputText}
      oninput={handleInputChange}
      placeholder="Type to add to queue..."
      style="width: 100%"
    />
  </div>
  <table>
    <tbody
      ><tr><td>Queued Text:</td><td>{queuedText}</td></tr><tr
        ><td>Queue Size:</td><td>{queueItems.length}</td></tr
      ><tr><td>Items Processed:</td><td>{processedCount}</td></tr><tr
        ><td>Queue Items:</td><td>{queueItems.join(', ')}</td></tr
      ></tbody
    >
  </table>
</div>
