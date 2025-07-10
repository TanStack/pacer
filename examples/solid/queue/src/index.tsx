import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { queue } from '@tanstack/solid-pacer/queuer'

function App1() {
  const [queueItems, setQueueItems] = createSignal<Array<number>>([])
  const [processedCount, setProcessedCount] = createSignal(0)

  function processQueueItem(item: number) {
    console.log(item)
  }

  // Create the simplified queuer function
  const queueItem = queue<number>(processQueueItem, {
    maxSize: 25,
    wait: 1000,
    onItemsChange: (queue) => {
      setQueueItems(queue.peekAllItems())
      setProcessedCount(queue.store.state.executionCount)
    },
  })

  return (
    <div>
      <h1>TanStack Pacer queue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Queue Size:</td>
            <td>{queueItems().length}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{processedCount()}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{queueItems().join(', ')}</td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={() => {
          const nextNumber = queueItems().length
            ? queueItems()[queueItems().length - 1] + 1
            : 1
          queueItem(nextNumber)
        }}
        disabled={queueItems().length >= 25}
      >
        Add Number
      </button>
    </div>
  )
}

function App2() {
  const [queueItems, setQueueItems] = createSignal<Array<string>>([])
  const [processedCount, setProcessedCount] = createSignal(0)
  const [inputText, setInputText] = createSignal('')
  const [queuedText, setQueuedText] = createSignal('')

  function processQueueItem(item: string) {
    setQueuedText(item)
  }

  // Create the simplified queuer function
  const queueTextChange = queue<string>(processQueueItem, {
    maxSize: 100,
    wait: 500,
    onItemsChange: (queue) => {
      setQueueItems(queue.peekAllItems())
      setProcessedCount(queue.store.state.executionCount)
    },
  })

  function handleInputChange(e: Event) {
    setInputText((e.target as HTMLInputElement).value)
    queueTextChange((e.target as HTMLInputElement).value)
  }

  return (
    <div>
      <h1>TanStack Pacer queue Example 2</h1>
      <div>
        <input
          autofocus
          type="search"
          value={inputText()}
          onInput={handleInputChange}
          placeholder="Type to add to queue..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Queued Text:</td>
            <td>{queuedText()}</td>
          </tr>
          <tr>
            <td>Queue Size:</td>
            <td>{queueItems().length}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{processedCount()}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{queueItems().join(', ')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [queueItems, setQueueItems] = createSignal<Array<number>>([])
  const [processedCount, setProcessedCount] = createSignal(0)
  const [currentValue, setCurrentValue] = createSignal(50)
  const [queuedValue, setQueuedValue] = createSignal(50)

  function processQueueItem(item: number) {
    setQueuedValue(item)
  }

  // Create the simplified queuer function
  const queueValue = queue<number>(processQueueItem, {
    maxSize: 100,
    wait: 100,
    onItemsChange: (queue) => {
      setQueueItems(queue.peekAllItems())
      setProcessedCount(queue.store.state.executionCount)
    },
  })

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    queueValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer queue Example 3</h1>
      <div style={{ 'margin-bottom': '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue()}
            onInput={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{currentValue()}</span>
        </label>
      </div>
      <div style={{ 'margin-bottom': '20px' }}>
        <label>
          Queued Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={queuedValue()}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{queuedValue()}</span>
        </label>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Queue Size:</td>
            <td>{queueItems().length}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{processedCount()}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{queueItems().join(', ')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

render(
  () => (
    <div>
      <App1 />
      <hr />
      <App2 />
      <hr />
      <App3 />
    </div>
  ),
  document.getElementById('root')!,
)
