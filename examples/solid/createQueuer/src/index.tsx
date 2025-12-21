import { render } from 'solid-js/web'
import { createQueuer } from '@tanstack/solid-pacer/queuer'
import { createSignal } from 'solid-js'
import { pacerDevtoolsPlugin } from '@tanstack/solid-pacer-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'

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
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => state,
  )

  return (
    <div>
      <h1>TanStack Pacer createQueuer Example 1</h1>
      <queuer.Subscribe
        selector={(state) => ({
          size: state.size,
          status: state.status,
          executionCount: state.executionCount,
          items: state.items,
          isFull: state.isFull,
          isEmpty: state.isEmpty,
          isIdle: state.isIdle,
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
            <div>Queue Items: {state().items.join(', ')}</div>
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
                  const nextNumber = state().items.length
                    ? state().items[state().items.length - 1] + 1
                    : 1
                  queuer.addItem(nextNumber)
                }}
                disabled={state().isFull}
              >
                Add Number
              </button>
              <button
                disabled={state().isEmpty}
                onClick={() => {
                  const item = queuer.getNextItem()
                  console.log('getNextItem item', item)
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
            </div>
          </>
        )}
      </queuer.Subscribe>
      <queuer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state(), null, 2)}
          </pre>
        )}
      </queuer.Subscribe>
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
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => state,
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
          <queuer.Subscribe
            selector={(state) => ({
              size: state.size,
              executionCount: state.executionCount,
              items: state.items,
            })}
          >
            {(state) => (
              <>
                <tr>
                  <td>Queued Text:</td>
                  <td>{queuedText()}</td>
                </tr>
                <tr>
                  <td>Queue Size:</td>
                  <td>{state().size}</td>
                </tr>
                <tr>
                  <td>Items Processed:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Queue Items:</td>
                  <td>{state().items.join(', ')}</td>
                </tr>
              </>
            )}
          </queuer.Subscribe>
        </tbody>
      </table>
      <queuer.Subscribe
        selector={(state) => ({
          isEmpty: state.isEmpty,
          isRunning: state.isRunning,
        })}
      >
        {(state) => (
          <div
            style={{
              display: 'grid',
              'grid-template-columns': 'repeat(2, 1fr)',
              gap: '8px',
              'max-width': '600px',
              margin: '16px 0',
            }}
          >
            <button onClick={() => queuer.clear()} disabled={state().isEmpty}>
              Clear Queue
            </button>
            <button onClick={() => queuer.reset()} disabled={state().isEmpty}>
              Reset Queue
            </button>
            <button onClick={() => queuer.start()} disabled={state().isRunning}>
              Start Processing
            </button>
            <button onClick={() => queuer.stop()} disabled={!state().isRunning}>
              Stop Processing
            </button>
          </div>
        )}
      </queuer.Subscribe>
      <queuer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state(), null, 2)}
          </pre>
        )}
      </queuer.Subscribe>
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
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => state,
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
          <queuer.Subscribe
            selector={(state) => ({
              size: state.size,
              executionCount: state.executionCount,
              items: state.items,
              isFull: state.isFull,
              isEmpty: state.isEmpty,
            })}
          >
            {(state) => (
              <>
                <tr>
                  <td>Instant Executions:</td>
                  <td>{instantExecutionCount()}</td>
                </tr>
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
                  <td>Items Processed:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>% Saved:</td>
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
                <tr>
                  <td>Queue Items:</td>
                  <td>{state().items.join(', ')}</td>
                </tr>
              </>
            )}
          </queuer.Subscribe>
        </tbody>
      </table>
      <queuer.Subscribe
        selector={(state) => ({
          isEmpty: state.isEmpty,
          isRunning: state.isRunning,
        })}
      >
        {(state) => (
          <div
            style={{
              display: 'grid',
              'grid-template-columns': 'repeat(2, 1fr)',
              gap: '8px',
              'max-width': '600px',
              margin: '16px 0',
            }}
          >
            <button onClick={() => queuer.clear()} disabled={state().isEmpty}>
              Clear Queue
            </button>
            <button onClick={() => queuer.reset()} disabled={state().isEmpty}>
              Reset Queue
            </button>
            <button onClick={() => queuer.start()} disabled={state().isRunning}>
              Start Processing
            </button>
            <button onClick={() => queuer.stop()} disabled={!state().isRunning}>
              Stop Processing
            </button>
          </div>
        )}
      </queuer.Subscribe>
      <queuer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state(), null, 2)}
          </pre>
        )}
      </queuer.Subscribe>
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
      <TanStackDevtools
        eventBusConfig={{
          debug: false,
        }}
        plugins={[pacerDevtoolsPlugin()]}
      />
    </div>
  ),
  document.getElementById('root')!,
)
