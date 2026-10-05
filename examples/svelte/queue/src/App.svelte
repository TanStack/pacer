<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { queue } from '@tanstack/svelte-pacer/queuer'

  let counterQueueItems = $state<Array<number>>([])

  let counterProcessedCount = $state(0)

  function counterProcessQueueItem(item: number) {
    console.log('Processing item:', item)
  }

  // Create the simplified queuer function
  const queueItem = queue<number>(counterProcessQueueItem, {
    key: 'Add Number Queue',
    maxSize: 25,
    wait: 1000,
    onItemsChange: (queue) => {
      counterQueueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      counterProcessedCount = queue.store.state.executionCount
    },
  })

  let rangeQueueItems = $state<Array<number>>([])

  let rangeProcessedCount = $state(0)

  let currentValue = $state(50)

  let queuedValue = $state(50)

  function rangeProcessQueueItem(item: number) {
    queuedValue = item
  }

  // Create the simplified queuer function
  const queueValue = queue<number>(rangeProcessQueueItem, {
    key: 'Range Change Queue',
    maxSize: 100,
    wait: 100,
    onItemsChange: (queue) => {
      rangeQueueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      rangeProcessedCount = queue.store.state.executionCount
    },
  })

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    queueValue(newValue)
  }

  let searchQueueItems = $state<Array<string>>([])

  let searchProcessedCount = $state(0)

  let inputText = $state('')

  let queuedText = $state('')

  function searchProcessQueueItem(item: string) {
    queuedText = item
  }

  // Create the simplified queuer function
  const queueTextChange = queue<string>(searchProcessQueueItem, {
    key: 'Text Change Queue',
    maxSize: 100,
    wait: 500,
    onItemsChange: (queue) => {
      searchQueueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      searchProcessedCount = queue.store.state.executionCount
    },
  })

  function handleInputChange(e: Event) {
    inputText = (e.target as HTMLInputElement).value
    queueTextChange((e.target as HTMLInputElement).value)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer queue Example 1</h1>
    <table>
      <tbody
        ><tr><td>Queue Size:</td><td>{counterQueueItems.length}</td></tr><tr
          ><td>Items Processed:</td><td>{counterProcessedCount}</td></tr
        ><tr><td>Queue Items:</td><td>{counterQueueItems.join(', ')}</td></tr
        ></tbody
      >
    </table>
    <button
      onclick={() => {
        const nextNumber = counterQueueItems.length
          ? counterQueueItems[counterQueueItems.length - 1]! + 1
          : 1
        queueItem(nextNumber)
      }}
      disabled={counterQueueItems.length >= 25}
    >
      Add Number
    </button>
  </div>
  <hr />
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
          ><td>Queue Size:</td><td>{searchQueueItems.length}</td></tr
        ><tr><td>Items Processed:</td><td>{searchProcessedCount}</td></tr><tr
          ><td>Queue Items:</td><td>{searchQueueItems.join(', ')}</td></tr
        ></tbody
      >
    </table>
  </div>
  <hr />
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
        ><tr><td>Queue Size:</td><td>{rangeQueueItems.length}</td></tr><tr
          ><td>Items Processed:</td><td>{rangeProcessedCount}</td></tr
        ><tr><td>Queue Items:</td><td>{rangeQueueItems.join(', ')}</td></tr
        ></tbody
      >
    </table>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
