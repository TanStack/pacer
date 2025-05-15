import { render } from 'solid-js/web'
import { createQueuer } from '@tanstack/solid-pacer/queuer'
import { createSignal } from 'solid-js'

function App1() {
  const queuer = createQueuer(
    (item) => {
      console.log('processing item', item)
    },
    {
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      maxSize: 25,
      started: false,
      wait: 1000, // wait 1 second between processing items - wait is optional!
    },
  )

  return (
    <div>
      <h1>TanStack Pacer createQueuer Example 1</h1>
      <div>Queue Size: {queuer.size()}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {queuer.isFull() ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queuer.peek()}</div>
      <div>Queue Empty: {queuer.isEmpty() ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.isIdle() ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.isRunning() ? 'Running' : 'Stopped'}</div>
      <div>Items Processed: {queuer.executionCount()}</div>
      <div>Queue Items: {queuer.allItems().join(', ')}</div>
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
            const nextNumber = queuer.allItems().length
              ? queuer.allItems()[queuer.allItems().length - 1] + 1
              : 1
            queuer.addItem(nextNumber)
          }}
          disabled={queuer.isFull()}
        >
          Add Number
        </button>
        <button
          disabled={queuer.isEmpty()}
          onClick={() => {
            const item = queuer.getNextItem()
            console.log('getNextItem item', item)
          }}
        >
          Process Next
        </button>
        <button onClick={() => queuer.clear()} disabled={queuer.isEmpty()}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()} disabled={queuer.isEmpty()}>
          Reset Queue
        </button>
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

function App2() {
  const [inputText, setInputText] = createSignal('')
  const [queuedText, setQueuedText] = createSignal('')

  const queuer = createQueuer(
    (item) => {
      setQueuedText(item as string)
    },
    {
      maxSize: 100,
      wait: 500,
    },
  )

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setInputText(newValue)
    queuer.addItem(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createQueuer Example 2</h1>
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
            <td>{queuer.size()}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{queuer.executionCount()}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{queuer.allItems().join(', ')}</td>
          </tr>
        </tbody>
      </table>
      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(2, 1fr)',
          gap: '8px',
          'max-width': '600px',
          margin: '16px 0',
        }}
      >
        <button onClick={() => queuer.clear()} disabled={queuer.isEmpty()}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()} disabled={queuer.isEmpty()}>
          Reset Queue
        </button>
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

function App3() {
  const [currentValue, setCurrentValue] = createSignal(50)
  const [queuedValue, setQueuedValue] = createSignal(50)
  const [instantExecutionCount, setInstantExecutionCount] = createSignal(0)

  const queuer = createQueuer(
    (item) => {
      setQueuedValue(item as number)
    },
    {
      maxSize: 100,
      wait: 100,
    },
  )

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    queuer.addItem(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createQueuer Example 3</h1>
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
            <td>Instant Executions:</td>
            <td>{instantExecutionCount()}</td>
          </tr>
          <tr>
            <td>Queue Size:</td>
            <td>{queuer.size()}</td>
          </tr>
          <tr>
            <td>Queue Full:</td>
            <td>{queuer.isFull() ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queue Empty:</td>
            <td>{queuer.isEmpty() ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{queuer.executionCount()}</td>
          </tr>
          <tr>
            <td>% Saved:</td>
            <td>
              {instantExecutionCount() === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount() - queuer.executionCount()) /
                      instantExecutionCount()) *
                      100,
                  )}
              %
            </td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>{queuer.allItems().join(', ')}</td>
          </tr>
        </tbody>
      </table>
      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(2, 1fr)',
          gap: '8px',
          'max-width': '600px',
          margin: '16px 0',
        }}
      >
        <button onClick={() => queuer.clear()} disabled={queuer.isEmpty()}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()} disabled={queuer.isEmpty()}>
          Reset Queue
        </button>
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
