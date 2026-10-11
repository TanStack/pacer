import type { OctaneRateLimiter } from '@tanstack/octane-pacer'
import { useState } from 'octane'
import { useRateLimiter } from '@tanstack/octane-pacer'
export const capture: {
  utility?: OctaneRateLimiter<() => void, { count: number }>
  other?: OctaneRateLimiter<() => void>
  cleanups: number[]
} = { cleanups: [] }
export function Fixture() @{
  const [amount, setAmount] = useState(100)
  const utility = useRateLimiter(
    () => {},
    {
      ...{ limit: amount, window: 1000 },
      onUnmount: () => capture.cleanups.push(amount),
    },
    (state) => ({ count: state.executionCount }),
  )
  const other = useRateLimiter(() => {}, { limit: amount, window: 1000 })
  capture.utility = utility
  capture.other = other
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
