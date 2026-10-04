import { createElement, useState } from 'octane'
import { useDebouncer } from '@tanstack/octane-pacer'
import type { OctaneDebouncer } from '@tanstack/octane-pacer'

export const capture: {
  utility?: OctaneDebouncer<() => void>
  renders: number
} = { renders: 0 }
export function Fixture() @{
  const utility = useDebouncer(() => {}, { wait: 1000 })
  const [visible, setVisible] = useState(true)
  capture.utility = utility
  <div>
    <button onClick={() => setVisible(false)}>Remove child</button>
    @if (visible) {
      <utility.Subscribe
        selector={(state) => ({ pending: state.isPending })}
        children={(state) => {
          capture.renders++
          return createElement('output', {}, String(state.pending))
        }}
      />
    }
  </div>
}
