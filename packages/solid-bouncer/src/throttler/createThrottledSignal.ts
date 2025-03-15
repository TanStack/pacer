import { createSignal } from 'solid-js'
import { createThrottler } from './createThrottler'
import type { ThrottlerOptions } from '@tanstack/bouncer/throttler'

export function createThrottledSignal<TValue>(
  value: TValue,
  options: ThrottlerOptions,
) {
  const [throttledValue, setThrottledValue] = createSignal<TValue>(value)

  const throttler = createThrottler(
    (value: TValue | ((prev: TValue) => TValue)) => {
      if (typeof value === 'function') {
        setThrottledValue(value as (prev: TValue) => TValue)
      } else {
        setThrottledValue(() => value)
      }
    },
    options,
  )

  return [throttledValue, throttler.maybeExecute, throttler] as const
}
