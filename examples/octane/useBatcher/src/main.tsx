import { createRoot, useLayoutEffect } from 'octane'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { useState } from 'octane'
import { useBatcher } from '@tanstack/octane-pacer/batcher'
import { PacerProvider } from '@tanstack/octane-pacer/provider'

function App1() {
  const [processedBatches, setProcessedBatches] = useState<
    Array<Array<number>>
  >([])
  function processBatch(items: Array<number>) {
    setProcessedBatches((prev) => [...prev, items])
    console.log('processing batch', items)
  }
  const batcher = useBatcher(
    processBatch,
    {
      key: 'useBatcher',
      // started: false, // true by default
      maxSize: 5, // Process in batches of 5 (if comes before wait time)
      wait: 3000, // wait up to 3 seconds before processing a batch (if time elapses before maxSize is reached)
      getShouldExecute: (items, _batcher) => items.includes(42), // or pass in a custom function to determine if the batch should be processed
    },
    // Alternative to batcher.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )
  return (
    <div>
      <h1>TanStack Pacer useBatcher Example 1</h1>
      <batcher.Subscribe
        selector={(state) => ({
          size: state.size,
          executionCount: state.executionCount,
          totalItemsProcessed: state.totalItemsProcessed,
        })}
      >
        {({ size, executionCount, totalItemsProcessed }) => (
          <>
            <div>Batch Size: {size}</div>
            <div>Batch Max Size: {5}</div>
            <div>Batch Items: {batcher.peekAllItems().join(', ')}</div>
            <div>Batches Processed: {executionCount}</div>
            <div>Items Processed: {totalItemsProcessed}</div>
            <div>
              Processed Batches:{' '}
              {processedBatches.map((b, i) => (
                <>
                  <span key={i}>[{b.join(', ')}]</span>,{' '}
                </>
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
                  const nextNumber = batcher.peekAllItems().length
                    ? batcher.peekAllItems()[
                        batcher.peekAllItems().length - 1
                      ]! + 1
                    : 1
                  batcher.addItem(nextNumber)
                }}
              >
                Add Number
              </button>
              <button
                disabled={size === 0}
                onClick={() => {
                  batcher.flush()
                }}
              >
                Flush Current Batch
              </button>
            </div>
          </>
        )}
      </batcher.Subscribe>
      <batcher.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </batcher.Subscribe>
    </div>
  )
}

function PacerExample() {
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return
    const target = document.createElement('div')
    document.body.append(target)
    const host = new TanStackDevtoolsCore({ plugins: [pacerDevtoolsPlugin()] })
    host.mount(target)
    return () => {
      host.unmount()
      target.remove()
    }
  }, [])
  // Keep Solid's document-level devtools delegation outside Octane's application events.
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onInput={(event) => event.stopPropagation()}
    >
      <PacerProvider
      // defaultOptions={{
      //   batcher: {
      //     maxSize: 10,
      //   },
      // }}
      >
        <div>
          <App1 />
          <hr />
        </div>
      </PacerProvider>
    </div>
  )
}
createRoot(document.getElementById('app')!).render(PacerExample)
