import { createEffect } from 'solid-js'
import { createThrottledSignal } from './createThrottledSignal'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

export function createThrottledValue<TValue>(
  value: TValue,
  options: ThrottlerOptions,
) {
  const [throttledValue, setThrottledValue, throttler] = createThrottledSignal(
    value,
    options,
  )
  createEffect(() => {
    setThrottledValue(() => value)
    return () => {
      throttler.cancel()
    }
  })

  return [throttledValue, throttler] as const
}
