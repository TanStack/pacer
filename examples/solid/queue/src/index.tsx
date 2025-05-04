import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { queue } from '@tanstack/solid-pacer/queuer'

function App1() {
  const [queueItems, setQueueItems] = createSignal<Array<number>>([])
  const [processedCount, setProcessedCount] = createSignal(0)

  // Create the simplified queuer function
  const queueItem = queue<number>({
    maxSize: 25,
    wait: 1000,
    onItemsChange: (queue) => {
      setQueueItems(queue.getAllItems())
      setProcessedCount(queue.getExecutionCount())
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

  // Create the simplified queuer function
  const queueTextChange = queue<string>({
    maxSize: 100,
    wait: 500,
    onGetNextItem: (item, _queue) => {
      setQueuedText(item)
    },
    onItemsChange: (queue) => {
      setQueueItems(queue.getAllItems())
      setProcessedCount(queue.getExecutionCount())
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

render(
  () => (
    <div>
      <App1 />
      <hr />
      <App2 />
    </div>
  ),
  document.getElementById('root')!,
)
