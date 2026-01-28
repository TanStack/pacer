import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useBatcher } from '@tanstack/react-pacer/batcher'
import { PacerProvider } from '@tanstack/react-pacer/provider'

function App() {
  const [processedBatches, setProcessedBatches] = useState<
    Array<Array<string>>
  >([])

  const batcher = useBatcher(
    (userIds: string[]) => {
      // Simulate API call to fetch user data
      setProcessedBatches((prev) => [...prev, userIds])
      console.log('Fetching users:', userIds)
    },
    {
      maxSize: 5,
      wait: 2000,
      deduplicateItems: true,
      getItemKey: (userId) => userId,
      maxTrackedKeys: 100,
      onDuplicate: (newItem, existingItem) => {
        if (existingItem) {
          console.log(`Duplicate in batch: ${newItem}`)
        } else {
          console.log(`Already processed: ${newItem}`)
        }
      },
    },
  )

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>TanStack Pacer - Cross-Batch Deduplication Example</h1>
      <p>
        This example demonstrates how <code>deduplicateItems</code> prevents
        duplicate processing <strong>both within and across batches</strong>.
        Once an item is processed, it won't be processed again until you clear
        the history.
      </p>

      <div
        style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>Simulate API Requests</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Click buttons to request user data. Items that have already been
          processed will be skipped automatically.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const result = batcher.addItem('user-123')
              if (!result) {
                alert('user-123 was already processed! Skipping...')
              }
            }}
            style={{
              padding: '10px 15px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Fetch user-123
          </button>
          <button
            onClick={() => {
              const result = batcher.addItem('user-456')
              if (!result) {
                alert('user-456 was already processed! Skipping...')
              }
            }}
            style={{
              padding: '10px 15px',
              background: '#51cf66',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Fetch user-456
          </button>
          <button
            onClick={() => {
              const result = batcher.addItem('user-789')
              if (!result) {
                alert('user-789 was already processed! Skipping...')
              }
            }}
            style={{
              padding: '10px 15px',
              background: '#ffa94d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Fetch user-789
          </button>
          <button
            onClick={() => {
              const result = batcher.addItem('user-999')
              if (!result) {
                alert('user-999 was already processed! Skipping...')
              }
            }}
            style={{
              padding: '10px 15px',
              background: '#845ef7',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Fetch user-999
          </button>
        </div>
      </div>

      <batcher.Subscribe
        selector={(state) => ({
          size: state.size,
          executionCount: state.executionCount,
          totalItemsProcessed: state.totalItemsProcessed,
          processedKeys: state.processedKeys,
        })}
      >
        {({ size, executionCount, totalItemsProcessed, processedKeys }) => (
          <div
            style={{
              background: '#e7f5ff',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            <h3>Statistics</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              <div>
                <strong>Current Batch Size:</strong> {size}
              </div>
              <div>
                <strong>Batches Processed:</strong> {executionCount}
              </div>
              <div>
                <strong>Total Items Processed:</strong> {totalItemsProcessed}
              </div>
              <div>
                <strong>Tracked Keys:</strong> {processedKeys.length}
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <strong>Current Batch Items:</strong>
              <div
                style={{
                  marginTop: '5px',
                  padding: '10px',
                  background: 'white',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}
              >
                {batcher.peekAllItems().length > 0
                  ? batcher.peekAllItems().join(', ')
                  : '(empty)'}
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <strong>Already Processed Keys:</strong>
              <div
                style={{
                  marginTop: '5px',
                  padding: '10px',
                  background: '#ffe8e8',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              >
                {processedKeys.length > 0
                  ? processedKeys.join(', ')
                  : '(none yet)'}
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                These keys will be skipped if you try to add them again.
              </p>
            </div>
          </div>
        )}
      </batcher.Subscribe>

      <div
        style={{
          background: '#fff3bf',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>Processed Batches</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Batches will be processed after 2 seconds or when 5 unique items are
          collected.
        </p>
        <div style={{ marginTop: '10px' }}>
          {processedBatches.length === 0 ? (
            <div style={{ color: '#999', fontStyle: 'italic' }}>
              No batches processed yet
            </div>
          ) : (
            processedBatches.map((batch, i) => (
              <div
                key={i}
                style={{
                  padding: '8px',
                  background: 'white',
                  borderRadius: '4px',
                  marginBottom: '5px',
                  fontFamily: 'monospace',
                }}
              >
                Batch #{i + 1}: [{batch.join(', ')}]
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => batcher.flush()}
          disabled={batcher.peekAllItems().length === 0}
          style={{
            padding: '10px 15px',
            background:
              batcher.peekAllItems().length === 0 ? '#ccc' : '#228be6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor:
              batcher.peekAllItems().length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Flush Batch Now
        </button>
        <button
          onClick={() => {
            batcher.clearProcessedKeys()
          }}
          style={{
            padding: '10px 15px',
            background: '#fa5252',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear Processed Keys
        </button>
        <button
          onClick={() => {
            batcher.reset()
            setProcessedBatches([])
          }}
          style={{
            padding: '10px 15px',
            background: '#868e96',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reset All
        </button>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <h4>💡 How It Works</h4>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>deduplicateItems: true</strong> enables both in-batch and
            cross-batch deduplication
          </li>
          <li>
            Within a batch: duplicates are merged using{' '}
            <code>deduplicateStrategy</code>
          </li>
          <li>
            Across batches: once processed, items are tracked in{' '}
            <code>processedKeys</code>
          </li>
          <li>
            <code>maxTrackedKeys: 100</code> limits memory usage (oldest keys
            are evicted first)
          </li>
          <li>
            Use <strong>Clear Processed Keys</strong> to allow re-processing of
            previously processed items
          </li>
          <li>
            Similar to <code>RateLimiter.executionTimes</code> tracking pattern
          </li>
        </ul>
      </div>

      <batcher.Subscribe selector={(state) => state}>
        {(state) => (
          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Debug: Full Batcher State
            </summary>
            <pre
              style={{
                marginTop: '10px',
                padding: '10px',
                background: '#f1f3f5',
                borderRadius: '4px',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(state, null, 2)}
            </pre>
          </details>
        )}
      </batcher.Subscribe>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <PacerProvider>
    <App />
  </PacerProvider>,
)
