import { useState } from 'react'
import { StoragePersister } from '@tanstack/persister/storage-persister'
import type { StoragePersisterOptions } from '@tanstack/persister/storage-persister'

export function useStoragePersister<
  TState,
  TSelected extends Partial<TState> = TState,
>(
  options: StoragePersisterOptions<TState, TSelected>,
): StoragePersister<TState, TSelected> {
  const [persister] = useState(() => new StoragePersister(options))

  persister.setOptions(options)

  return persister
}
