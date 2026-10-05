import type { OctaneDebouncer } from '@tanstack/octane-pacer'
import { useState } from 'octane'
import { useDebouncer } from '@tanstack/octane-pacer'
export const capture: {
  utility?: OctaneDebouncer<() => void, { count: number }>
  other?: OctaneDebouncer<() => void>
  cleanups: number[]
} = { cleanups: [] }
export function Fixture() @{
  const [amount, setAmount] = useState(100)
  const utility = useDebouncer(
    () => {},
    { ...{ wait: amount }, onUnmount: () => capture.cleanups.push(amount) },
    (state) => ({ count: state.executionCount }),
  )
  const other = useDebouncer(() => {}, { wait: amount })
  capture.utility = utility
  capture.other = other
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
