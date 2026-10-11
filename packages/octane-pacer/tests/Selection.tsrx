import { useState } from 'octane'
import { useDebouncer } from '@tanstack/octane-pacer'
import type { OctaneDebouncer } from '@tanstack/octane-pacer'
export const capture: {
  utility?: OctaneDebouncer<() => void, { count: number }>
} = {}
export function Fixture() @{
  const [offset, setOffset] = useState(1)
  const utility = useDebouncer(
    () => {},
    { wait: 100 },
    (state) => ({ count: state.executionCount + offset }),
  )
  capture.utility = utility
  <div>
    <button onClick={() => setOffset(2)}>Update selection</button>
    <output>{utility.state.count}</output>
  </div>
}
