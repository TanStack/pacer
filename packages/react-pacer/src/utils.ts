import { shallowEqualObjects } from '@tanstack/pacer/compare'
import { useRef } from 'react'

export function useSetOptions<TOptions extends Record<string, any>>(
  options: TOptions,
  setOptions: (options: TOptions) => void,
) {
  const currentOptions = useRef<TOptions>(options)
  if (!shallowEqualObjects(currentOptions.current, options)) {
    currentOptions.current = options
    setOptions(currentOptions.current)
  }
  return currentOptions
}
