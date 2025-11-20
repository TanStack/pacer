/**
 * Note: @tanstack/pacer-lite is a stripped-down alternative designed for library use.
 * It does not include TanStack Store, reactivity features, framework adapters, or devtools support
 * that are available in the core @tanstack/pacer package for app development.
 * The core version also includes more advanced features in some utilities.
 */
import { liteRateLimit } from '@tanstack/pacer-lite/lite-rate-limiter'

function createApp1() {
  const container = document.createElement('div')

  let instantCount = 0
  let limitedCount = 0
  let executionCount = 0
  let rejectionCount = 0
  let windowType: 'fixed' | 'sliding' = 'fixed'

  let rateLimitedSetCount = liteRateLimit(
    (newCount: number) => {
      limitedCount = newCount
      executionCount += 1
      console.log('✅ Rate limited count updated:', newCount)
      updateDisplay()
    },
    {
      limit: 5,
      window: 5000,
      windowType: windowType,
    },
  )

  function increment() {
    instantCount += 1
    const executed = rateLimitedSetCount(instantCount)
    if (!executed) {
      rejectionCount += 1
      console.log('❌ Rejected by rate limiter')
    }
    updateDisplay()
  }

  function reset() {
    instantCount = 0
    limitedCount = 0
    executionCount = 0
    rejectionCount = 0
    updateDisplay()
  }

  function setWindowType(type: 'fixed' | 'sliding') {
    windowType = type
    instantCount = 0
    limitedCount = 0
    executionCount = 0
    rejectionCount = 0
    rateLimitedSetCount = liteRateLimit(
      (newCount: number) => {
        limitedCount = newCount
        executionCount += 1
        console.log('✅ Rate limited count updated:', newCount)
        updateDisplay()
      },
      {
        limit: 5,
        window: 5000,
        windowType: windowType,
      },
    )
    updateDisplay()
  }

  function updateDisplay() {
    container.innerHTML = `
      <div>
        <h1>TanStack Pacer liteRateLimit Example</h1>
        <div>
          <label>
            <input type="radio" name="windowType" value="fixed" ${windowType === 'fixed' ? 'checked' : ''} />
            Fixed Window
          </label>
          <label>
            <input type="radio" name="windowType" value="sliding" ${windowType === 'sliding' ? 'checked' : ''} />
            Sliding Window
          </label>
        </div>
        <table>
          <tbody>
            <tr>
              <td>Execution Count:</td>
              <td>${executionCount}</td>
            </tr>
            <tr>
              <td>Rejection Count:</td>
              <td>${rejectionCount}</td>
            </tr>
            <tr>
              <td colspan="2"><hr /></td>
            </tr>
            <tr>
              <td>Instant Count:</td>
              <td>${instantCount}</td>
            </tr>
            <tr>
              <td>Rate Limited Count:</td>
              <td>${limitedCount}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <button id="increment-btn">Increment</button>
          <button id="reset-btn">Reset</button>
        </div>
      </div>
    `

    container
      .querySelector('#increment-btn')
      ?.addEventListener('click', increment)
    container.querySelector('#reset-btn')?.addEventListener('click', reset)
    container
      .querySelector('input[value="fixed"]')
      ?.addEventListener('change', () => setWindowType('fixed'))
    container
      .querySelector('input[value="sliding"]')
      ?.addEventListener('change', () => setWindowType('sliding'))
  }

  updateDisplay()
  return container
}

const app = document.getElementById('app')!
app.appendChild(createApp1())

console.log(
  'liteRateLimit example ready! Click increment rapidly and watch the console for rate limited executions.',
)
