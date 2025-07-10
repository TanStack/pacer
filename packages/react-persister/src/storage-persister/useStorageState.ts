import { useEffect, useState } from 'react'
import { useStoragePersister } from './useStoragePersister'
import type { StoragePersisterOptions } from '@tanstack/persister/storage-persister'

function useStorageState<TState, TSelected extends Partial<TState> = TState>(
  initialValue: TState,
  options: StoragePersisterOptions<TState, TSelected>,
) {
  const persister = useStoragePersister<TState, TSelected>(options)

  const [state, setState] = useState<TState | TSelected>(initialValue)

  useEffect(() => {
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setState(persister.loadState() ?? initialValue)
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    persister.saveState(state)
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

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
export function useLocalStorageState<
  TValue,
  TSelected extends Partial<TValue> = TValue,
>(
  key: string,
  initialValue: TValue,
  options?: Omit<StoragePersisterOptions<TValue, TSelected>, 'key' | 'storage'>,
) {
  return useStorageState(initialValue, {
    ...options,
    key,
    storage: typeof window !== 'undefined' ? localStorage : null,
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
export function useSessionStorageState<
  TValue,
  TSelected extends Partial<TValue> = TValue,
>(
  key: string,
  initialValue: TValue,
  options?: Omit<StoragePersisterOptions<TValue, TSelected>, 'key' | 'storage'>,
) {
  return useStorageState(initialValue, {
    ...options,
    key,
    storage: typeof window !== 'undefined' ? sessionStorage : null,
  })
}
