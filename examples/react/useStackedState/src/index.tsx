import { scan } from 'react-scan' // dev-tools for demo
import ReactDOM from 'react-dom/client'
import { useStackedState } from '@tanstack/react-bouncer/stacker'

function App() {
  const [stackedItems, stacker] = useStackedState({
    maxSize: 10,
    initialItems: [1, 2, 3, 4, 5],
  })

  return (
    <div>
      <h1>TanStack Bouncer useStackedState Example</h1>
      <div>Stack Size: {stacker.size()}</div>
      <div>Stack Max Size: {10}</div>
      <div>Stack Full: {stacker.isFull() ? 'Yes' : 'No'}</div>
      <div>Stack Empty: {stacker.isEmpty() ? 'Yes' : 'No'}</div>
      <div>Stack Peek: {stacker.peek()}</div>
      <div>Stacked Items: {stackedItems.join(', ')}</div>
      <div>
        <button
          onClick={() => {
            const nextNumber = stackedItems.length
              ? stackedItems[stackedItems.length - 1] + 1
              : 1
            stacker.push(nextNumber)
          }}
          disabled={stacker.isFull()}
        >
          Add Number
        </button>
        <button
          disabled={stacker.isEmpty()}
          onClick={() => {
            const item = stacker.pop()
            console.log('popped item', item)
          }}
        >
          Process Next
        </button>
        <button onClick={() => stacker.clear()} disabled={stacker.isEmpty()}>
          Clear Stack
        </button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan() // dev-tools for demo
