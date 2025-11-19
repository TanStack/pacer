import { LiteDebouncer } from '@tanstack/pacer-lite/lite-debouncer'

function createApp1() {
  const container = document.createElement('div')

  let instantCount = 0
  let debouncedCount = 0

  const debouncer = new LiteDebouncer(
    (newCount: number) => {
      debouncedCount = newCount
      console.log('🔄 Debounced count updated:', newCount)
      updateDisplay()
    },
    {
      wait: 500,
      leading: false,
      trailing: true,
    },
  )

  function increment() {
    instantCount += 1
    debouncer.maybeExecute(instantCount)
    updateDisplay()
  }

  function decrement() {
    instantCount -= 1
    debouncer.maybeExecute(instantCount)
    updateDisplay()
  }

  function flush() {
    debouncer.flush()
    console.log('⚡ Forced flush executed')
  }

  function cancel() {
    debouncer.cancel()
    console.log('❌ Debouncer canceled')
    updateDisplay()
  }

  function updateDisplay() {
    container.innerHTML = `
      <div>
        <h1>TanStack Pacer LiteDebouncer Example</h1>
        <table>
          <tbody>
            <tr>
              <td>Instant Count:</td>
              <td>${instantCount}</td>
            </tr>
            <tr>
              <td>Debounced Count:</td>
              <td>${debouncedCount}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <button id="increment-btn">Increment</button>
          <button id="decrement-btn">Decrement</button>
          <button id="flush-btn">Flush</button>
          <button id="cancel-btn">Cancel</button>
        </div>
      </div>
    `

    container
      .querySelector('#increment-btn')
      ?.addEventListener('click', increment)
    container
      .querySelector('#decrement-btn')
      ?.addEventListener('click', decrement)
    container.querySelector('#flush-btn')?.addEventListener('click', flush)
    container.querySelector('#cancel-btn')?.addEventListener('click', cancel)
  }

  updateDisplay()
  return container
}

const app = document.getElementById('app')!
app.appendChild(createApp1())

console.log(
  'LiteDebouncer example ready! Click the buttons rapidly and watch the console for debounced executions.',
)
