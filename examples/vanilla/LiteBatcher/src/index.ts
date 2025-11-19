import { LiteBatcher } from '@tanstack/pacer-lite/lite-batcher'

function createApp1() {
  const container = document.createElement('div')

  let processedBatches: Array<Array<number>> = []
  let batchesProcessed = 0
  let totalItemsProcessed = 0
  let lastNumber = 0

  const batcher = new LiteBatcher<number>(
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
    batcher.addItem(lastNumber)
    updateDisplay()
  }

  function flushBatch() {
    batcher.flush()
    console.log('⚡ Flushed current batch')
    updateDisplay()
  }

  function clearBatch() {
    batcher.clear()
    console.log('🔄 Batch cleared')
    updateDisplay()
  }

  function cancelPending() {
    batcher.cancel()
    console.log('❌ Cancelled pending batch')
    updateDisplay()
  }

  function updateDisplay() {
    const batchSize = batcher.size
    const isEmpty = batcher.isEmpty
    const isPending = batcher.isPending
    const batchItems = batcher.peekAllItems()

    container.innerHTML = `
      <div>
        <h1>TanStack Pacer LiteBatcher Example</h1>
        <table>
          <tbody>
            <tr>
              <td>Batch Size:</td>
              <td>${batchSize}</td>
            </tr>
            <tr>
              <td>Batch Max Size:</td>
              <td>5</td>
            </tr>
            <tr>
              <td>Batch Items:</td>
              <td>${batchItems.length > 0 ? batchItems.join(', ') : 'None'}</td>
            </tr>
            <tr>
              <td>Is Pending:</td>
              <td>${isPending ? 'Yes' : 'No'}</td>
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
          <button id="flush-btn" ${isEmpty ? 'disabled' : ''}>Flush Current Batch</button>
          <button id="clear-btn" ${isEmpty ? 'disabled' : ''}>Clear Batch</button>
          <button id="cancel-btn" ${!isPending ? 'disabled' : ''}>Cancel Pending</button>
        </div>
      </div>
    `

    container.querySelector('#add-item-btn')?.addEventListener('click', addItem)
    container.querySelector('#flush-btn')?.addEventListener('click', flushBatch)
    container.querySelector('#clear-btn')?.addEventListener('click', clearBatch)
    container
      .querySelector('#cancel-btn')
      ?.addEventListener('click', cancelPending)
  }

  updateDisplay()
  return container
}

const app = document.getElementById('app')!
app.appendChild(createApp1())

console.log(
  'LiteBatcher example ready! Add items and watch them batch automatically, or use flush to process immediately.',
)
