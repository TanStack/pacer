import { LiteThrottler } from '@tanstack/pacer-lite/lite-throttler'

function createApp1() {
  const container = document.createElement('div')

  let instantCount = 0
  let throttledCount = 0

  const throttler = new LiteThrottler(
    (newCount: number) => {
      throttledCount = newCount
      console.log('🔄 Throttled count updated:', newCount)
      updateDisplay()
    },
    {
      wait: 500,
      leading: true,
      trailing: true,
    },
  )

  function increment() {
    instantCount += 1
    throttler.maybeExecute(instantCount)
    updateDisplay()
  }

  function decrement() {
    instantCount -= 1
    throttler.maybeExecute(instantCount)
    updateDisplay()
  }

  function flush() {
    throttler.flush()
    console.log('⚡ Forced flush executed')
  }

  function cancel() {
    throttler.cancel()
    console.log('❌ Throttler canceled')
    updateDisplay()
  }

  function updateDisplay() {
    container.innerHTML = `
      <div>
        <h1>TanStack Pacer LiteThrottler Example</h1>
        <table>
          <tbody>
            <tr>
              <td>Instant Count:</td>
              <td>${instantCount}</td>
            </tr>
            <tr>
              <td>Throttled Count:</td>
              <td>${throttledCount}</td>
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
  'LiteThrottler example ready! Click the buttons rapidly and watch the console for throttled executions.',
)
