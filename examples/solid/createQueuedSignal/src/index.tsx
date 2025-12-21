import { render } from 'solid-js/web'
import { createQueuedSignal } from '@tanstack/solid-pacer/queuer'
import { createSignal } from 'solid-js'

function App1() {
  // Queuer that uses Solid signals under the hood
  function processItem(item: number) {
    console.log('processing item', item)
  }

  const [queueItems, addItem, queuer] = createQueuedSignal(
    processItem,
    {
      maxSize: 25,
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      started: false,
      wait: 1000, // wait 1 second between processing items - wait is optional!
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => ({
    //   items: state.items, // required for createQueuedSignal
    //   size: state.size,
    //   isFull: state.isFull,
    //   isEmpty: state.isEmpty,
    //   isIdle: state.isIdle,
    //   status: state.status,
    //   executionCount: state.executionCount,
    //   isRunning: state.isRunning,
    // }),
  )

  return (
    <div>
      <h1>TanStack Pacer createQueuedSignal Example 1</h1>
      <queuer.Subscribe
        selector={(state) => ({
          size: state.size,
          isFull: state.isFull,
          isEmpty: state.isEmpty,
          isIdle: state.isIdle,
          status: state.status,
          executionCount: state.executionCount,
          isRunning: state.isRunning,
        })}
      >
        {(state) => (
          <>
            <div>Queue Size: {state().size}</div>
            <div>Queue Max Size: {25}</div>
            <div>Queue Full: {state().isFull ? 'Yes' : 'No'}</div>
            <div>Queue Peek: {queuer.peekNextItem()}</div>
            <div>Queue Empty: {state().isEmpty ? 'Yes' : 'No'}</div>
            <div>Queue Idle: {state().isIdle ? 'Yes' : 'No'}</div>
            <div>Queuer Status: {state().status}</div>
            <div>Items Processed: {state().executionCount}</div>
          </>
        )}
      </queuer.Subscribe>
      <div>Queue Items: {queueItems().join(', ')}</div>
      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(2, 1fr)',
          gap: '8px',
          'max-width': '600px',
          margin: '16px 0',
        }}
      >
        <queuer.Subscribe
          selector={(state) => ({
            isFull: state.isFull,
            isEmpty: state.isEmpty,
            isRunning: state.isRunning,
          })}
        >
          {(state) => (
            <>
              <button
                onClick={() => {
                  const nextNumber = queueItems().length
                    ? queueItems()[queueItems().length - 1] + 1
                    : 1
                  addItem(nextNumber)
                }}
                disabled={state().isFull}
              >
                Add Number
              </button>
              <button
                disabled={state().isEmpty}
                onClick={() => {
                  queuer.execute()
                }}
              >
                Process Next
              </button>
              <button onClick={() => queuer.clear()} disabled={state().isEmpty}>
                Clear Queue
              </button>
              <button onClick={() => queuer.reset()} disabled={state().isEmpty}>
                Reset Queue
              </button>
              <button
                onClick={() => queuer.start()}
                disabled={state().isRunning}
              >
                Start Processing
              </button>
              <button
                onClick={() => queuer.stop()}
                disabled={!state().isRunning}
              >
                Stop Processing
              </button>
            </>
          )}
        </queuer.Subscribe>
      </div>
      <pre style={{ 'margin-top': '20px' }}>
        {JSON.stringify(queuer.store.state, null, 2)}
      </pre>
    </div>
  )
}

function App2() {
  const [currentValue, setCurrentValue] = createSignal(50)
  const [instantExecutionCount, setInstantExecutionCount] = createSignal(0)

  // Queuer that processes a single value with delays
  const [, addItem, queuer] = createQueuedSignal(
    (_item: number) => {
      // This will update automatically through the queue
    },
    {
      maxSize: 100,
      started: true,
      wait: 100,
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => ({
    //   items: state.items, // required for createQueuedSignal
    //   size: state.size,
    //   isFull: state.isFull,
    //   isEmpty: state.isEmpty,
    //   isIdle: state.isIdle,
    //   status: state.status,
    //   executionCount: state.executionCount,
    //   isRunning: state.isRunning,
    // }),
  )

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    addItem(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createQueuedSignal Example 2</h1>
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
      <table>
        <tbody>
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount()}</td>
          </tr>
          <queuer.Subscribe
            selector={(state) => ({
              size: state.size,
              isFull: state.isFull,
              isEmpty: state.isEmpty,
              isIdle: state.isIdle,
              status: state.status,
              executionCount: state.executionCount,
            })}
          >
            {(state) => (
              <>
                <tr>
                  <td>Queue Size:</td>
                  <td>{state().size}</td>
                </tr>
                <tr>
                  <td>Queue Full:</td>
                  <td>{state().isFull ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Queue Empty:</td>
                  <td>{state().isEmpty ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Queue Idle:</td>
                  <td>{state().isIdle ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Queuer Status:</td>
                  <td>{state().status}</td>
                </tr>
                <tr>
                  <td>Items Processed:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Saved Executions:</td>
                  <td>{instantExecutionCount() - state().executionCount}</td>
                </tr>
                <tr>
                  <td>% Reduction:</td>
                  <td>
                    {instantExecutionCount() === 0
                      ? '0'
                      : Math.round(
                          ((instantExecutionCount() - state().executionCount) /
                            instantExecutionCount()) *
                            100,
                        )}
                    %
                  </td>
                </tr>
              </>
            )}
          </queuer.Subscribe>
        </tbody>
      </table>
      <div style={{ color: '#666', 'font-size': '0.9em' }}>
        <p>Queued with 100ms wait time</p>
      </div>
      <pre style={{ 'margin-top': '20px' }}>
        {JSON.stringify(queuer.store.state, null, 2)}
      </pre>
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
