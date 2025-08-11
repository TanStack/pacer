import { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { PacerDevtoolsPanel } from "@tanstack/pacer-react-devtools"
import { TanstackDevtools } from "@tanstack/react-devtools"
import { queue } from '@tanstack/react-pacer/queuer'

function App1() {
  const [queueItems, setQueueItems] = useState<Array<number>>([])
  const [processedCount, setProcessedCount] = useState(0)

  function processQueueItem(item: number) {
    console.log('Processing item:', item)
  }

  // Create the simplified queuer function
  const queueItem = useCallback(
    queue<number>(processQueueItem, {
      maxSize: 25,
      wait: 1000,
      onItemsChange: (queue) => {
        setQueueItems(queue.peekAllItems())
        setProcessedCount(queue.store.state.executionCount)
      },
    }),
    [], // must be memoized to avoid re-creating the queue on every render (consider using useQueuer instead in react)
  )

  return (
    <div>
      <h1>TanStack Pacer queue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Queue Size:</td>
            <td>{queueItems.length}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{processedCount}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{queueItems.join(', ')}</td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={() => {
          const nextNumber = queueItems.length
            ? queueItems[queueItems.length - 1] + 1
            : 1
          queueItem(nextNumber)
        }}
        disabled={queueItems.length >= 25}
      >
        Add Number
      </button>
    </div>
  )
}

function App2() {
  const [queueItems, setQueueItems] = useState<Array<string>>([])
  const [processedCount, setProcessedCount] = useState(0)
  const [inputText, setInputText] = useState('')
  const [queuedText, setQueuedText] = useState('')

  function processQueueItem(item: string) {
    setQueuedText(item)
  }

  // Create the simplified queuer function
  const queueTextChange = useCallback(
    queue<string>(processQueueItem, {
      maxSize: 100,
      wait: 500,
      onItemsChange: (queue) => {
        setQueueItems(queue.peekAllItems())
        setProcessedCount(queue.store.state.executionCount)
      },
    }),
    [],
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value)
    queueTextChange(e.target.value)
  }

  return (
    <div>
      <h1>TanStack Pacer queue Example 2</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type to add to queue..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Queued Text:</td>
            <td>{queuedText}</td>
          </tr>
          <tr>
            <td>Queue Size:</td>
            <td>{queueItems.length}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{processedCount}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{queueItems.join(', ')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [queueItems, setQueueItems] = useState<Array<number>>([])
  const [processedCount, setProcessedCount] = useState(0)
  const [currentValue, setCurrentValue] = useState(50)
  const [queuedValue, setQueuedValue] = useState(50)

  function processQueueItem(item: number) {
    setQueuedValue(item)
  }

  // Create the simplified queuer function
  const queueValue = useCallback(
    queue<number>(processQueueItem, {
      maxSize: 100,
      wait: 100,
      onItemsChange: (queue) => {
        setQueueItems(queue.peekAllItems())
        setProcessedCount(queue.store.state.executionCount)
      },
    }),
    [],
  )

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    queueValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer queue Example 3</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue}
            onChange={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{currentValue}</span>
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Queued Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={queuedValue}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{queuedValue}</span>
        </label>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Queue Size:</td>
            <td>{queueItems.length}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{processedCount}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{queueItems.join(', ')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
    <hr />
    <App3 />

    <TanstackDevtools eventBusConfig={{
      debug: false
    }} plugins={[
      { name: "TanStack Pacer", render: <PacerDevtoolsPanel /> }
    ]} />
  </div>,
)
