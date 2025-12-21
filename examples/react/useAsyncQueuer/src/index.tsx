import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncQueuer } from '@tanstack/react-pacer/async-queuer'
import { PacerProvider } from '@tanstack/react-pacer/provider'

const fakeWaitTime = 500

type Item = number

function App() {
  const [concurrency, setConcurrency] = useState(2)

  // The function to process each item (now a number)
  async function processItem(item: Item): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, fakeWaitTime))
    console.log(`Processed ${item}`)
  }

  const asyncQueuer = useAsyncQueuer(
    processItem, // your function to queue/process items
    {
      maxSize: 25,
      initialItems: Array.from({ length: 10 }, (_, i) => i + 1),
      concurrency, // Process 2 items concurrently
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
    },
    // Alternative to asyncQueuer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  return (
    <div>
      <h1>TanStack Pacer useAsyncQueuer Example</h1>
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
      >
        {({
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
        }) => (
          <>
            <div></div>
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
              Concurrency:{' '}
              <input
                type="number"
                min={1}
                value={concurrency}
                onChange={(e) =>
                  setConcurrency(Math.max(1, parseInt(e.target.value) || 1))
                }
                style={{ width: '60px' }}
              />
            </div>
            <div style={{ minHeight: '250px' }}>
              Queue Items:
              {asyncQueuer.peekAllItems().map((item, index) => (
                <div key={index}>
                  {index}: {item}
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                maxWidth: '600px',
                margin: '16px 0',
              }}
            >
              <button
                onClick={() => {
                  const nextNumber = asyncQueuer.peekAllItems().length
                    ? Math.max(...asyncQueuer.peekAllItems()) + 1
                    : 1
                  asyncQueuer.addItem(nextNumber)
                }}
                disabled={isFull}
              >
                Add Async Task
              </button>
              <button onClick={() => asyncQueuer.getNextItem()}>
                Get Next Item
              </button>
              <button onClick={() => asyncQueuer.clear()} disabled={isEmpty}>
                Clear Queue
              </button>
              <button onClick={() => asyncQueuer.flush()} disabled={isEmpty}>
                Flush Queue
              </button>
              <button onClick={() => asyncQueuer.start()} disabled={isRunning}>
                Start Processing
              </button>
              <button onClick={() => asyncQueuer.stop()} disabled={!isRunning}>
                Stop Processing
              </button>
              <button onClick={() => asyncQueuer.reset()}>Reset Queue</button>
            </div>
          </>
        )}
      </asyncQueuer.Subscribe>
      <asyncQueuer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </asyncQueuer.Subscribe>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  // optionally, provide default options to an optional PacerProvider
  <PacerProvider
  // defaultOptions={{
  //   queuer: {
  //     maxSize: 50,
  //   },
  // }}
  >
    <App />
  </PacerProvider>,
)
