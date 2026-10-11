import { useState } from 'octane'
import {
  useDebouncedCallback,
  useDebouncedState,
  useDebouncedValue,
  useQueuedState,
} from '@tanstack/octane-pacer'
export const capture = { calls: [] as string[] }
export function Fixture() @{
  const [source, setSource] = useState('first')
  const callback = useDebouncedCallback(
    (value: string) => {
      capture.calls.push(value)
    },
    { wait: 20 },
  )
  const [value, setValue] = useDebouncedState(1, { wait: 20 })
  const [derived] = useDebouncedValue(source, { wait: 20 })
  const [items, addItem, queue] = useQueuedState(
    (item: string) => {
      capture.calls.push(item)
    },
    { started: false },
  )
  <div>
    <button
      id="callback"
      onClick={() => {
        callback('first')
        callback('last')
      }}
    >
      Callback
    </button>
    <button id="state" onClick={() => setValue((previous) => previous + 2)}>
      State
    </button>
    <button id="source" onClick={() => setSource('second')}>
      Source
    </button>
    <button
      id="queue"
      onClick={() => {
        addItem('queued')
      }}
    >
      Queue
    </button>
    <button id="start" onClick={() => queue.start()}>
      Start
    </button>
    <output id="value">{value}</output>
    <output id="derived">{derived}</output>
    <output id="items">{items.length}</output>
  </div>
}
