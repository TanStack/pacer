import { createSignal } from 'solid-js'
import { createThrottler } from './createThrottler'
import type { ThrottlerOptions } from '@tanstack/bouncer/throttler'

export function createThrottledSignal<TValue>(
  value: TValue,
  options: ThrottlerOptions,
) {
  const [throttledValue, setThrottledValue] = createSignal<TValue>(value)

  const throttler = createThrottler(setThrottledValue, options)

  return [throttledValue, throttler.maybeExecute, throttler] as const
}
