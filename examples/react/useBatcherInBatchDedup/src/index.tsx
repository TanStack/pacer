import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useBatcher } from '@tanstack/react-pacer/batcher'
import { PacerProvider } from '@tanstack/react-pacer/provider'

function App1() {
  // Use your state management library of choice
  const [processedBatches, setProcessedBatches] = useState<
    Array<Array<string>>
  >([])
  const [log, setLog] = useState<string[]>([])

  // The function that will process a batch of items
  function processBatch(items: Array<string>) {
    setProcessedBatches((prev) => [...prev, items])
    setLog((prev) => [...prev, `✅ Processed batch: [${items.join(', ')}]`])
    console.log('processing batch', items)
  }

  const batcher = useBatcher(
    processBatch,
    {
      maxSize: 5,
      wait: 3000,
      // Enable in-batch deduplication
      deduplicateItems: true,
      deduplicateStrategy: 'keep-first', // or 'keep-last'
    },
  )

  const addItem = (item: string) => {
    const result = batcher.addItem(item)
    if (result) {
      setLog((prev) => [...prev, `➕ Added: "${item}"`])
    } else {
      setLog((prev) => [...prev, `⚠️ Duplicate ignored: "${item}"`])
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>TanStack Pacer - In-Batch Deduplication</h1>
      <p style={{ color: '#666', maxWidth: '800px' }}>
        When <code>deduplicateItems: true</code>, duplicate items within the same batch are automatically ignored.
        This example demonstrates how duplicates are handled before the batch is processed.
      </p>
      
      <batcher.Subscribe
        selector={(state) => ({
          size: state.size,
          executionCount: state.executionCount,
          totalItemsProcessed: state.totalItemsProcessed,
        })}
      >
        {({ size, executionCount, totalItemsProcessed }) => (
          <>
            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div><strong>Current Batch Size:</strong> {size} / 5</div>
                <div><strong>Batches Processed:</strong> {executionCount}</div>
                <div><strong>Current Batch:</strong> [{batcher.peekAllItems().join(', ')}]</div>
                <div><strong>Total Items Processed:</strong> {totalItemsProcessed}</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>🧪 Test Deduplication</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Click buttons multiple times. Duplicates within the same batch will be ignored!
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <button 
                  onClick={() => addItem('🍎 apple')} 
                  style={{ padding: '10px 16px', fontSize: '14px', cursor: 'pointer' }}
                >
                  Add 🍎 apple
                </button>
                <button 
                  onClick={() => addItem('🍌 banana')} 
                  style={{ padding: '10px 16px', fontSize: '14px', cursor: 'pointer' }}
                >
                  Add 🍌 banana
                </button>
                <button 
                  onClick={() => addItem('🍒 cherry')} 
                  style={{ padding: '10px 16px', fontSize: '14px', cursor: 'pointer' }}
                >
                  Add 🍒 cherry
                </button>
                <button 
                  onClick={() => addItem('🍇 grape')} 
                  style={{ padding: '10px 16px', fontSize: '14px', cursor: 'pointer' }}
                >
                  Add 🍇 grape
                </button>
                <button 
                  onClick={() => addItem('🍊 orange')} 
                  style={{ padding: '10px 16px', fontSize: '14px', cursor: 'pointer' }}
                >
                  Add 🍊 orange
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={size === 0}
                  onClick={() => {
                    setLog((prev) => [...prev, '🚀 Flushing batch...'])
                    batcher.flush()
                  }}
                  style={{ 
                    padding: '10px 20px', 
                    background: size === 0 ? '#ccc' : '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: size === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Flush Batch Now
                </button>
                <button
                  onClick={() => {
                    batcher.reset()
                    setProcessedBatches([])
                    setLog(['🔄 Reset all state'])
                  }}
                  style={{ 
                    padding: '10px 20px', 
                    background: '#f44336', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Reset All
                </button>
              </div>
              <div style={{ marginTop: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '4px', fontSize: '13px' }}>
                <strong>💡 Tip:</strong> Add the same item multiple times before the batch is processed. 
                Notice how duplicates are ignored!
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4>📦 Processed Batches</h4>
                <div style={{ 
                  background: '#e8f5e9', 
                  padding: '15px', 
                  borderRadius: '4px', 
                  minHeight: '150px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {processedBatches.length === 0 ? (
                    <span style={{ color: '#999' }}>No batches processed yet</span>
                  ) : (
                    processedBatches.map((b, i) => (
                      <div key={i} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                        <strong>Batch #{i + 1}:</strong> [{b.join(', ')}]
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h4>📋 Activity Log</h4>
                <div style={{ 
                  background: '#fff3e0', 
                  padding: '15px', 
                  borderRadius: '4px', 
                  minHeight: '150px', 
                  maxHeight: '300px', 
                  overflow: 'auto' 
                }}>
                  {log.length === 0 ? (
                    <span style={{ color: '#999' }}>No activity yet</span>
                  ) : (
                    log.map((entry, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          fontSize: '13px', 
                          fontFamily: 'monospace',
                          marginBottom: '4px',
                          padding: '4px',
                          background: entry.includes('Duplicate') ? '#ffebee' : 'transparent',
                          borderRadius: '2px'
                        }}
                      >
                        {entry}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </batcher.Subscribe>

      <details style={{ marginTop: '20px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          🐛 Debug: Full State
        </summary>
        <batcher.Subscribe selector={(state) => state}>
          {(state) => (
            <pre style={{ 
              marginTop: '10px', 
              padding: '15px', 
              background: '#f1f3f5', 
              borderRadius: '4px', 
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(state, null, 2)}
            </pre>
          )}
        </batcher.Subscribe>
      </details>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <PacerProvider>
    <App1 />
  </PacerProvider>,
)
