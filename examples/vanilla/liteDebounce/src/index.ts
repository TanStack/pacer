import { liteDebounce } from '@tanstack/pacer-lite/lite-debouncer'

function createApp1() {
  const container = document.createElement('div')

  let instantCount = 0
  let debouncedCount = 0

  const debouncedSetCount = liteDebounce(
    (newCount: number) => {
      debouncedCount = newCount
      console.log('🔄 Debounced count updated:', newCount)
      updateDisplay()
    },
    {
      wait: 500,
    },
  )

  function increment() {
    instantCount += 1
    debouncedSetCount(instantCount)
    updateDisplay()
  }

  function decrement() {
    instantCount -= 1
    debouncedSetCount(instantCount)
    updateDisplay()
  }

  function updateDisplay() {
    container.innerHTML = `
      <div>
        <h1>TanStack Pacer liteDebounce Example</h1>
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
  'liteDebounce example ready! Click the buttons rapidly and watch the console for debounced executions.',
)
