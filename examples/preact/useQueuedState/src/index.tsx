import { useState } from 'preact/hooks'
import { render } from 'preact'
import type { JSX } from 'preact'
import { useQueuedState } from '@tanstack/preact-pacer/queuer'

function App1() {
  // Queuer that uses Preact.useState under the hood
  function processItem(item: number) {
    console.log('processing item', item)
  }

  const [queueItems, addItem, queuer] = useQueuedState(
    processItem,
    {
      maxSize: 25,
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      started: false,
      wait: 1000, // wait 1 second between processing items - wait is optional!
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      items: state.items, // required for useQueuedState
      size: state.size,
      isFull: state.isFull,
      isEmpty: state.isEmpty,
      isIdle: state.isIdle,
      status: state.status,
      executionCount: state.executionCount,
      isRunning: state.isRunning,
    }),
  )

  return (
    <div>
      <h1>TanStack Pacer useQueuedState Example 1</h1>
      <div>Queue Size: {queuer.state.size}</div>
      <div>Queue Max Size: {25}</div>
      <div>Queue Full: {queuer.state.isFull ? 'Yes' : 'No'}</div>
      <div>Queue Peek: {queuer.peekNextItem()}</div>
      <div>Queue Empty: {queuer.state.isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: {queuer.state.isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: {queuer.state.status}</div>
      <div>Items Processed: {queuer.state.executionCount}</div>
      <div>Queue Items: {queueItems.join(', ')}</div>
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
            const nextNumber = queueItems.length
              ? queueItems[queueItems.length - 1] + 1
              : 1
            addItem(nextNumber)
          }}
          disabled={queuer.state.isFull}
        >
          Add Number
        </button>
        <button
          disabled={queuer.state.isEmpty}
          onClick={() => {
            queuer.execute()
          }}
        >
          Process Next
        </button>
        <button onClick={() => queuer.clear()} disabled={queuer.state.isEmpty}>
          Clear Queue
        </button>
        <button onClick={() => queuer.reset()} disabled={queuer.state.isEmpty}>
          Reset Queue
        </button>
        <button
          onClick={() => queuer.start()}
          disabled={queuer.state.isRunning}
        >
          Start Processing
        </button>
        <button
          onClick={() => queuer.stop()}
          disabled={!queuer.state.isRunning}
        >
          Stop Processing
        </button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(queuer.store.state, null, 2)}
      </pre>
    </div>
  )
}

function App2() {
  const [currentValue, setCurrentValue] = useState(50)
  const [queuedValue, setQueuedValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Queuer that processes a single value with delays
  const [, addItem, queuer] = useQueuedState(
    (item: number) => {
      setQueuedValue(item)
    },
    {
      maxSize: 100,
      started: true,
      wait: 100,
    },
    (state) => ({
      items: state.items, // required for useQueuedState
      size: state.size,
      isFull: state.isFull,
      isEmpty: state.isEmpty,
      isIdle: state.isIdle,
      status: state.status,
      executionCount: state.executionCount,
      isRunning: state.isRunning,
    }),
  )

  function handleRangeChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = parseInt(e.currentTarget.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    addItem(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useQueuedState Example 2</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue}
            onInput={handleRangeChange}
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
            <td>{queuer.state.size}</td>
          </tr>
          <tr>
            <td>Queue Full:</td>
            <td>{queuer.state.isFull ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queue Empty:</td>
            <td>{queuer.state.isEmpty ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queue Idle:</td>
            <td>{queuer.state.isIdle ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queuer Status:</td>
            <td>{queuer.state.status}</td>
          </tr>
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>{queuer.state.executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{instantExecutionCount - queuer.state.executionCount}</td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              {instantExecutionCount === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount - queuer.state.executionCount) /
                      instantExecutionCount) *
                      100,
                  )}
              %
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Queued with 100ms wait time</p>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(queuer.store.state, null, 2)}
      </pre>
    </div>
  )
}

const root = document.getElementById('root')!
render(
  <div>
    <App1 />
    <hr />
    <App2 />
  </div>,
  root,
)
