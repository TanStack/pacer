/**
 * Note: @tanstack/pacer-lite is a stripped-down alternative designed for library use.
 * It does not include TanStack Store, reactivity features, framework adapters, or devtools support
 * that are available in the core @tanstack/pacer package for app development.
 * The core version also includes more advanced features in some utilities.
 */
import { liteQueue } from '@tanstack/pacer-lite/lite-queuer'

function createApp1() {
  const container = document.createElement('div')

  let executionCount = 0
  let processedItems: number[] = []

  const processItem = liteQueue(
    (item: number) => {
      executionCount += 1
      processedItems.push(item)
      console.log('✅ Processing item:', item)
      updateDisplay()
    },
    {
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      maxSize: 25,
      started: true,
      wait: 1000,
    },
  )

  function addItem() {
    const nextNumber =
      processedItems.length > 0 ? Math.max(...processedItems) + 1 : 1
    const added = processItem(nextNumber)
    if (!added) {
      console.log('❌ Queue is full, item rejected')
    }
    updateDisplay()
  }

  function clearQueue() {
    processedItems = []
    executionCount = 0
    console.log('🔄 Queue cleared')
    updateDisplay()
  }

  function updateDisplay() {
    container.innerHTML = `
      <div>
        <h1>TanStack Pacer liteQueue Example</h1>
        <table>
          <tbody>
            <tr>
              <td>Items Processed:</td>
              <td>${executionCount}</td>
            </tr>
            <tr>
              <td>Processed Items:</td>
              <td>${processedItems.length > 0 ? processedItems.join(', ') : 'None'}</td>
            </tr>
            <tr>
              <td>Queue Max Size:</td>
              <td>25</td>
            </tr>
          </tbody>
        </table>
        <div>
          <button id="add-item-btn">Add Number</button>
          <button id="clear-btn">Clear Processed</button>
        </div>
        <div style="margin-top: 1rem; color: #666; font-size: 0.9em;">
          <p>Note: liteQueue function automatically processes items with 1 second delay. Queue state is not accessible - use LiteQueuer class for full control.</p>
        </div>
      </div>
    `

    container.querySelector('#add-item-btn')?.addEventListener('click', addItem)
    container.querySelector('#clear-btn')?.addEventListener('click', clearQueue)
  }

  updateDisplay()
  return container
}

const app = document.getElementById('app')!
app.appendChild(createApp1())

console.log(
  'liteQueue example ready! Items will be processed automatically with 1 second delay between each.',
)
