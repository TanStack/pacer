import type { OctaneAsyncDebouncer } from '@tanstack/octane-pacer'
import { useState } from 'octane'
import { useAsyncDebouncer } from '@tanstack/octane-pacer'
export const capture: {
  utility?: OctaneAsyncDebouncer<() => Promise<void>, { count: number }>
  other?: OctaneAsyncDebouncer<() => Promise<void>>
  cleanups: number[]
} = { cleanups: [] }
export function Fixture() @{
  const [amount, setAmount] = useState(100)
  const utility = useAsyncDebouncer(
    async () => {},
    { ...{ wait: amount }, onUnmount: () => capture.cleanups.push(amount) },
    (state) => ({ count: state.settleCount }),
  )
  const other = useAsyncDebouncer(async () => {}, { wait: amount })
  capture.utility = utility
  capture.other = other
  <div>
    <button onClick={() => setAmount(200)}>Update</button>
    <output>{utility.state.count}</output>
  </div>
}
