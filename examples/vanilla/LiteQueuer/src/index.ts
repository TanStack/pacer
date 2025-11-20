/**
 * Note: @tanstack/pacer-lite is a stripped-down alternative designed for library use.
 * It does not include TanStack Store, reactivity features, framework adapters, or devtools support
 * that are available in the core @tanstack/pacer package for app development.
 * The core version also includes more advanced features in some utilities.
 */
import { LiteQueuer } from '@tanstack/pacer-lite/lite-queuer'

function createApp1() {
  const container = document.createElement('div')

  let executionCount = 0

  const queuer = new LiteQueuer(
    (item: number) => {
      executionCount += 1
      console.log('✅ Processing item:', item)
      updateDisplay()
    },
    {
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      maxSize: 25,
      started: false,
      wait: 1000,
    },
  )

  function addItem() {
    const nextNumber =
      queuer.size > 0
        ? (queuer.peekAllItems()[queuer.peekAllItems().length - 1] ?? 0) + 1
        : 1
    const added = queuer.addItem(nextNumber)
    if (!added) {
      console.log('❌ Queue is full, item rejected')
    }
    updateDisplay()
  }

  function executeNext() {
    const item = queuer.execute()
    if (item !== undefined) {
      executionCount += 1
      console.log('✅ Manually processed item:', item)
    }
    updateDisplay()
  }

  function clearQueue() {
    queuer.clear()
    executionCount = 0
    console.log('🔄 Queue cleared')
    updateDisplay()
  }

  function startProcessing() {
    queuer.start()
    console.log('▶️ Started processing')
    updateDisplay()
  }

  function stopProcessing() {
    queuer.stop()
    console.log('⏸️ Stopped processing')
    updateDisplay()
  }

  function flushQueue() {
    queuer.flush()
    console.log('⚡ Flushed queue')
    updateDisplay()
  }

  function updateDisplay() {
    const queueSize = queuer.size
    const isEmpty = queuer.isEmpty
    const isFull = queueSize >= 25
    const isRunning = queuer.isQueueRunning
    const peekNext = queuer.peekNextItem()
    const allItems = queuer.peekAllItems()

    container.innerHTML = `
      <div>
        <h1>TanStack Pacer LiteQueuer Example</h1>
        <table>
          <tbody>
            <tr>
              <td>Queue Size:</td>
              <td>${queueSize}</td>
            </tr>
            <tr>
              <td>Queue Max Size:</td>
              <td>25</td>
            </tr>
            <tr>
              <td>Queue Full:</td>
              <td>${isFull ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <td>Queue Peek:</td>
              <td>${peekNext ?? 'None'}</td>
            </tr>
            <tr>
              <td>Queue Empty:</td>
              <td>${isEmpty ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <td>Queuer Status:</td>
              <td>${isRunning ? 'Running' : 'Stopped'}</td>
            </tr>
            <tr>
              <td>Items Processed:</td>
              <td>${executionCount}</td>
            </tr>
            <tr>
              <td>Queue Items:</td>
              <td>${allItems.length > 0 ? allItems.join(', ') : 'None'}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <button id="add-item-btn" ${isFull ? 'disabled' : ''}>Add Number</button>
          <button id="execute-btn" ${isEmpty ? 'disabled' : ''}>Process Next</button>
          <button id="clear-btn" ${isEmpty ? 'disabled' : ''}>Clear Queue</button>
          <button id="start-btn" ${isRunning ? 'disabled' : ''}>Start Processing</button>
          <button id="stop-btn" ${!isRunning ? 'disabled' : ''}>Stop Processing</button>
          <button id="flush-btn" ${isEmpty ? 'disabled' : ''}>Flush Queue</button>
        </div>
      </div>
    `

    container.querySelector('#add-item-btn')?.addEventListener('click', addItem)
    container
      .querySelector('#execute-btn')
      ?.addEventListener('click', executeNext)
    container.querySelector('#clear-btn')?.addEventListener('click', clearQueue)
    container
      .querySelector('#start-btn')
      ?.addEventListener('click', startProcessing)
    container
      .querySelector('#stop-btn')
      ?.addEventListener('click', stopProcessing)
    container.querySelector('#flush-btn')?.addEventListener('click', flushQueue)
  }

  updateDisplay()
  return container
}

const app = document.getElementById('app')!
app.appendChild(createApp1())

console.log(
  'LiteQueuer example ready! Use the buttons to control queue processing.',
)
