import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createAsyncQueuer } from '@tanstack/solid-pacer/async-queuer'

const fakeWaitTime = 500

type Item = number

function App() {
  // Use your state management library of choice
  const [concurrency, setConcurrency] = createSignal(2)

  // The function to process each item (now a number)
  async function processItem(item: Item): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, fakeWaitTime))
    console.log(`Processed ${item}`)
  }

  const queuer = createAsyncQueuer(
    processItem,
    {
      maxSize: 25,
      initialItems: Array.from({ length: 10 }, (_, i) => i + 1),
      concurrency: () => concurrency(), // Process 2 items concurrently
      started: false,
      wait: 100, // for demo purposes - usually you would not want extra wait time if you are also throttling with concurrency
      onReject: (item, queuer) => {
        console.log(
          'Queue is full, rejecting item',
          item,
          queuer.store.state.rejectionCount,
        )
      },
      onError: (error, _item, queuer) => {
        console.error(
          'Error processing item',
          error,
          queuer.store.state.errorCount,
        ) // optionally, handle errors here instead of your own try/catch
      },
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      size: state.size,
      status: state.status,
      successCount: state.successCount,
      items: state.items,
      isFull: state.isFull,
      isEmpty: state.isEmpty,
      isIdle: state.isIdle,
      rejectionCount: state.rejectionCount,
      activeItems: state.activeItems,
      isRunning: state.isRunning,
    }),
  )

  return (
    <div>
      <h1>TanStack Pacer createAsyncQueuer Example</h1>
      <div></div>
      <div>Queue Size: {queuer.state().size}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {queuer.state().isFull ? 'Yes' : 'No'}</div>
      <div>Queue Empty: {queuer.state().isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.state().isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.state().status}</div>
      <div>Items Processed: {queuer.state().successCount}</div>
      <div>Items Rejected: {queuer.state().rejectionCount}</div>
      <div>Active Tasks: {queuer.state().activeItems.length}</div>
      <div>Pending Tasks: {queuer.state().items.length}</div>
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
        <For each={queuer.state().items}>
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
            const nextNumber = queuer.state().items.length
              ? Math.max(...queuer.state().items) + 1
              : 1
            queuer.addItem(nextNumber)
          }}
          disabled={queuer.state().isFull}
        >
          Add Async Task
        </button>
        <button onClick={() => queuer.getNextItem()}>Get Next Item</button>
        <button
          onClick={() => queuer.clear()}
          disabled={queuer.state().isEmpty}
        >
          Clear Queue
        </button>
        <br />
        <button
          onClick={() => queuer.start()}
          disabled={queuer.state().isRunning}
        >
          Start Processing
        </button>
        <button
          onClick={() => queuer.stop()}
          disabled={!queuer.state().isRunning}
        >
          Stop Processing
        </button>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
