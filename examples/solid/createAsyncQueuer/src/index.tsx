import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createAsyncQueuer } from '@tanstack/solid-pacer/async-queuer'

const fakeWaitTime = 500

type Item = number

function App() {
  // Use your state management library of choice
  const [queueItems, setQueueItems] = createSignal<Array<Item>>([])
  const [concurrency, setConcurrency] = createSignal(2)

  // The function to process each item (now a number)
  async function processItem(item: Item): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, fakeWaitTime))
    console.log(`Processed ${item}`)
  }

  const queuer = createAsyncQueuer<Item>(processItem, {
    maxSize: 25,
    initialItems: Array.from({ length: 10 }, (_, i) => i + 1),
    concurrency: () => concurrency(), // Process 2 items concurrently
    started: false,
    wait: 100, // for demo purposes - usually you would not want extra wait time if you are also throttling with concurrency
    onItemsChange: (queuer) => {
      setQueueItems(queuer.peekAllItems())
    },
    onReject: (item, queuer) => {
      console.log(
        'Queue is full, rejecting item',
        item,
        queuer.getRejectionCount(),
      )
    },
    onError: (error, queuer) => {
      console.error('Error processing item', error, queuer.getErrorCount()) // optionally, handle errors here instead of your own try/catch
    },
  })

  return (
    <div>
      <h1>TanStack Pacer createAsyncQueuer Example</h1>
      <div></div>
      <div>Queue Size: {queuer.size()}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {queuer.isFull() ? 'Yes' : 'No'}</div>
      <div>Queue Empty: {queuer.isEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.isIdle() ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.isRunning() ? 'Running' : 'Stopped'}</div>
      <div>Items Processed: {queuer.successCount()}</div>
      <div>Items Rejected: {queuer.rejectionCount()}</div>
      <div>Active Tasks: {queuer.activeItems().length}</div>
      <div>Pending Tasks: {queuer.pendingItems().length}</div>
      <div>
        Concurrency:{' '}
        <input
          type="number"
          min={1}
          value={concurrency()}
          onInput={(e) =>
            setConcurrency(Math.max(1, parseInt(e.currentTarget.value) || 1))
          }
          style={{ width: '60px' }}
        />
      </div>
      <div style={{ 'min-height': '250px' }}>
        Queue Items:
        <For each={queueItems()}>
          {(item, index) => (
            <div>
              {index()}: {item}
            </div>
          )}
        </For>
      </div>
      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(2, 1fr)',
          gap: '8px',
          'max-width': '600px',
          margin: '16px 0',
        }}
      >
        <button
          onClick={() => {
            const items = queueItems()
            const nextNumber = items.length ? Math.max(...items) + 1 : 1
            queuer.addItem(nextNumber)
          }}
          disabled={queuer.isFull()}
        >
          Add Async Task
        </button>
        <button onClick={() => queuer.getNextItem()}>Get Next Item</button>
        <button onClick={() => queuer.clear()} disabled={queuer.isEmpty()}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()}>Reset Queue</button>
        <button onClick={() => queuer.start()} disabled={queuer.isRunning()}>
          Start Processing
        </button>
        <button onClick={() => queuer.stop()} disabled={!queuer.isRunning()}>
          Stop Processing
        </button>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
