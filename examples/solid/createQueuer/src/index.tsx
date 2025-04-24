import { render } from 'solid-js/web'
import { createQueuer } from '@tanstack/solid-pacer/queuer'

function App() {
  const queuer = createQueuer({
    initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    maxSize: 25,
    started: false,
    wait: 1000, // wait 1 second between processing items - wait is optional!
  })

  return (
    <div>
      <h1>TanStack Pacer createQueuer Example</h1>
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

render(() => <App />, document.getElementById('root')!)
