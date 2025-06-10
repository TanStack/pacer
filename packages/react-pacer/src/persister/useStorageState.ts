import { useEffect, useState } from 'react'
import { useStoragePersister } from './useStoragePersister'
import type { StoragePersisterOptions } from '@tanstack/pacer/persister'

function useStorageState<TValue>(
  initialValue: TValue,
  options: StoragePersisterOptions<TValue>,
) {
  const { key } = options
  const persister = useStoragePersister<TValue>(options)

  const [state, setState] = useState<TValue>(() => {
    return persister.loadState(key) ?? initialValue
  })

  useEffect(() => {
    persister.saveState(key, state)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed.state) {
            setState(parsed.state)
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, state, persister])

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
