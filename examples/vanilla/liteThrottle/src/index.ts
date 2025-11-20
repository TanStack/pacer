/**
 * Note: @tanstack/pacer-lite is a stripped-down alternative designed for library use.
 * It does not include TanStack Store, reactivity features, framework adapters, or devtools support
 * that are available in the core @tanstack/pacer package for app development.
 * The core version also includes more advanced features in some utilities.
 */
import { liteThrottle } from '@tanstack/pacer-lite/lite-throttler'

function createApp1() {
  const container = document.createElement('div')

  let instantCount = 0
  let throttledCount = 0

  const throttledSetCount = liteThrottle(
    (newCount: number) => {
      throttledCount = newCount
      console.log('🔄 Throttled count updated:', newCount)
      updateDisplay()
    },
    {
      wait: 500,
    },
  )

  function increment() {
    instantCount += 1
    throttledSetCount(instantCount)
    updateDisplay()
  }

  function decrement() {
    instantCount -= 1
    throttledSetCount(instantCount)
    updateDisplay()
  }

  function updateDisplay() {
    container.innerHTML = `
      <div>
        <h1>TanStack Pacer liteThrottle Example</h1>
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
        </div>
      </div>
    `

    const incrementBtn = container.querySelector(
      '#increment-btn',
    ) as HTMLButtonElement
    const decrementBtn = container.querySelector(
      '#decrement-btn',
    ) as HTMLButtonElement
    incrementBtn?.addEventListener('click', increment)
    decrementBtn?.addEventListener('click', decrement)
  }

  updateDisplay()
  return container
}

const app = document.getElementById('app')!
app.appendChild(createApp1())

console.log(
  'liteThrottle example ready! Click the buttons rapidly and watch the console for throttled executions.',
)
