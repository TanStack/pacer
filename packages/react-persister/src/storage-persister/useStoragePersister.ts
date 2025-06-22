import { useState } from 'react'
import { StoragePersister } from '@tanstack/persister/storage-persister'
import { bindInstanceMethods } from '@tanstack/persister'
import type { StoragePersisterOptions } from '@tanstack/persister/storage-persister'

export function useStoragePersister<TState>(
  options: StoragePersisterOptions<TState>,
) {
  const [persister] = useState(() =>
    bindInstanceMethods(new StoragePersister<TState>(options)),
  )

  persister.setOptions(options)

  return persister
}
