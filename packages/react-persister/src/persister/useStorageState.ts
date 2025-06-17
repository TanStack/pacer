import { useEffect, useState } from 'react'
import { useStoragePersister } from './useStoragePersister'
import type { StoragePersisterOptions } from '@tanstack/persister/persister'

function useStorageState<TValue>(
  initialValue: TValue,
  options: StoragePersisterOptions<TValue>,
) {
  const persister = useStoragePersister<TValue>(options)

  const [state, setState] = useState<TValue>(() => {
    return persister.loadState() ?? initialValue
  })

  useEffect(() => {
    persister.saveState(state)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === options.key && e.newValue) {
        try {
          const parsed = (options.deserializer ?? JSON.parse)(e.newValue)
          if (parsed.state) {
            setState(parsed.state)
          }
        } catch (e) {
          console.error('Failed to parse storage event', e)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [state, persister, options.deserializer, options.key])

  return [state, setState] as const
}

/**
 * A hook that persists state to localStorage and syncs it across tabs
 *
 * @example
 * ```tsx
 * const [value, setValue] = useLocalStorageState('my-key', 'initial value')
 * ```
 */
export function useLocalStorageState<TValue>(
  key: string,
  initialValue: TValue,
  options?: {
    buster?: string
    maxAge?: number
  },
) {
  return useStorageState(initialValue, {
    key,
    storage: localStorage,
    ...options,
  })
}

/**
 * A hook that persists state to sessionStorage and syncs it across tabs
 *
 * @example
 * ```tsx
 * const [value, setValue] = useSessionStorageState('my-key', 'initial value')
 * ```
 */
export function useSessionStorageState<TValue>(
  key: string,
  initialValue: TValue,
  options?: {
    buster?: string
    maxAge?: number
  },
) {
  return useStorageState(initialValue, {
    key,
    storage: sessionStorage,
    ...options,
  })
}
