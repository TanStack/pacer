import { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { queue } from '@tanstack/react-pacer/queuer'

function App1() {
  const [queueItems, setQueueItems] = useState<Array<number>>([])
  const [processedCount, setProcessedCount] = useState(0)

  // Create the simplified queuer function
  const queueItem = useCallback(
    queue<number>({
      maxSize: 25,
      wait: 1000,
      onItemsChange: (queue) => {
        setQueueItems(queue.getAllItems())
        setProcessedCount(queue.getExecutionCount())
      },
    }),
    [],
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

  // Create the simplified queuer function
  const queueTextChange = useCallback(
    queue<string>({
      maxSize: 100,
      wait: 500,
      onGetNextItem: (item, _queue) => {
        setQueuedText(item)
      },
      onItemsChange: (queue) => {
        setQueueItems(queue.getAllItems())
        setProcessedCount(queue.getExecutionCount())
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

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
  </div>,
)
