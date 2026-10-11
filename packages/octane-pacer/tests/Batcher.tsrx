import type { OctaneBatcher } from '@tanstack/octane-pacer'
import { useState } from 'octane'
import { useBatcher } from '@tanstack/octane-pacer'
export const capture: {
  utility?: OctaneBatcher<unknown, { count: number }>
  other?: OctaneBatcher<unknown>
  cleanups: number[]
} = { cleanups: [] }
export function Fixture() @{
  const [amount, setAmount] = useState(100)
  const utility = useBatcher(
    () => {},
    {
      ...{ wait: amount, started: false },
      onUnmount: () => capture.cleanups.push(amount),
    },
    (state) => ({ count: state.executionCount }),
  )
  const other = useBatcher(() => {}, { wait: amount, started: false })
  capture.utility = utility
  capture.other = other
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
