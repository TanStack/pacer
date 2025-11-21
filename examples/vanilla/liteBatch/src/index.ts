/**
 * Note: @tanstack/pacer-lite is a stripped-down alternative designed for library use.
 * It does not include TanStack Store, reactivity features, framework adapters, or devtools support
 * that are available in the core @tanstack/pacer package for app development.
 * The core version also includes more advanced features in some utilities.
 */
import { liteBatch } from '@tanstack/pacer-lite/lite-batcher'

function createApp1() {
  const container = document.createElement('div')

  let processedBatches: Array<Array<number>> = []
  let batchesProcessed = 0
  let totalItemsProcessed = 0
  let lastNumber = 0

  const batchItems = liteBatch<number>(
    (items: Array<number>) => {
      processedBatches.push(items)
      batchesProcessed += 1
      totalItemsProcessed += items.length
      console.log('✅ Processing batch:', items)
      updateDisplay()
    },
    {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) => items.includes(42),
    },
  )

  function addItem() {
    lastNumber += 1
    batchItems(lastNumber)
    updateDisplay()
  }

  function updateDisplay() {
    container.innerHTML = `
      <div>
        <h1>TanStack Pacer liteBatch Example</h1>
        <table>
          <tbody>
            <tr>
              <td>Batch Max Size:</td>
              <td>5</td>
            </tr>
            <tr>
              <td>Batches Processed:</td>
              <td>${batchesProcessed}</td>
            </tr>
            <tr>
              <td>Items Processed:</td>
              <td>${totalItemsProcessed}</td>
            </tr>
            <tr>
              <td>Processed Batches:</td>
              <td>${processedBatches.length > 0 ? processedBatches.map((b) => `[${b.join(', ')}]`).join(', ') : 'None'}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <button id="add-item-btn">Add Number</button>
        </div>
        <div style="margin-top: 1rem; color: #666; font-size: 0.9em;">
          <p>Note: liteBatch function automatically processes batches. Batches process when: maxSize (5) is reached, wait time (3s) elapses, or item 42 is added. Use LiteBatcher class for manual control.</p>
        </div>
      </div>
    `

    container.querySelector('#add-item-btn')?.addEventListener('click', addItem)
  }

  updateDisplay()
  return container
}

const app = document.getElementById('app')!
app.appendChild(createApp1())

console.log(
  'liteBatch example ready! Add items and watch them batch automatically.',
)
