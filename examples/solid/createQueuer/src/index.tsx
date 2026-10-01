import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createQueuer } from '@tanstack/solid-pacer/queuer'
import { PacerProvider } from '@tanstack/solid-pacer/provider'
import { pacerDevtoolsPlugin } from '@tanstack/solid-pacer-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'

function App1() {
  // The function that we will be queuing
  function processItem(item: number) {
    console.log('processing item', item)
  }

  const queuer = createQueuer(
    processItem,
    {
      key: 'Add Number Queue',
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      maxSize: 25, // optional, defaults to Infinity
      started: false, // optional, defaults to true
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
          isFull: state.isFull,
          isEmpty: state.isEmpty,
          isIdle: state.isIdle,
          isRunning: state.isRunning,
          status: state.status,
          executionCount: state.executionCount,
          items: state.items,
        })}
      >
        {(state) => (
          <>
            <div>Queue Size: {state().size}</div>
            <div>Queue Max Size: {25}</div>
            <div>Queue Full: {state().isFull ? 'Yes' : 'No'}</div>
            <div>Queue Peek: {state().items[0]}</div>
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
                  const item = queuer.execute()
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
              <button onClick={() => queuer.flush()} disabled={state().isEmpty}>
                Flush Queue
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
  const [currentValue, setCurrentValue] = createSignal(50)
  const [queuedValue, setQueuedValue] = createSignal(50)
  const [submittedCount, setSubmittedCount] = createSignal(1)

  function processItem(item: number) {
    setQueuedValue(item)
  }

  const queuer = createQueuer(
    processItem,
    {
      key: 'Range Queue',
      maxSize: 100,
      initialItems: [currentValue()],
      wait: 100,
    },
    // Alternative to queuer.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => state,
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.currentTarget as HTMLInputElement).value, 10)
    setCurrentValue(newValue)
    setSubmittedCount((c) => c + 1)
    queuer.addItem(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createQueuer Example 2</h1>
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
            disabled
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
              isFull: state.isFull,
              isEmpty: state.isEmpty,
              isIdle: state.isIdle,
              isRunning: state.isRunning,
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
                  <td>{state().isRunning ? 'Running' : 'Stopped'}</td>
                </tr>
                <tr>
                  <td>Values Submitted:</td>
                  <td>{submittedCount()}</td>
                </tr>
                <tr>
                  <td>Items Processed:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Pending Items:</td>
                  <td>{state().size}</td>
                </tr>
              </>
            )}
          </queuer.Subscribe>
        </tbody>
      </table>
      <div style={{ color: '#666', 'font-size': '0.9em' }}>
        <p>Queued with 100ms wait time</p>
      </div>
      <div>
        <button onClick={() => queuer.flush()}>Flush Queue</button>
      </div>
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
    // optionally, provide default options to an optional PacerProvider
    <PacerProvider
    // defaultOptions={{
    //   queuer: {
    //     maxSize: 50,
    //   },
    // }}
    >
      <div>
        <App1 />
        <hr />
        <App2 />
      </div>
      <TanStackDevtools
        eventBusConfig={{
          debug: false,
        }}
        plugins={[pacerDevtoolsPlugin()]}
      />
    </PacerProvider>
  ),
  document.getElementById('root')!,
)
