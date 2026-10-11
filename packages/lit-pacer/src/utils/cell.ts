import type { ReactiveControllerHost } from 'lit'

export type SetValue<T> = (value: T | ((previous: T) => T)) => void
export type CellValue<T> = () => T
export type ValueSource<T> = () => T
export function readSource<T>(source: ValueSource<T>): T {
  return source()
}
export function createCell<T>(host: ReactiveControllerHost, initial: T) {
  let value = initial
  const set: SetValue<T> = (next) => {
    const updated =
      typeof next === 'function' ? (next as (previous: T) => T)(value) : next
    if (Object.is(value, updated)) return
    value = updated
    host.requestUpdate()
  }
  return { value: () => value, set }
}
export function observe<T>(
  host: ReactiveControllerHost,
  source: ValueSource<T>,
  callback: (value: T) => void,
) {
  let previous: T
  let initialized = false
  let connected = false
  const update = () => {
    const next = source()
    if (initialized && Object.is(previous, next)) return
    initialized = true
    previous = next
    callback(next)
  }
  host.addController({
    hostConnected() {
      connected = true
      update()
    },
    hostUpdate() {
      if (connected) update()
    },
    hostDisconnected() {
      connected = false
    },
  })
}
