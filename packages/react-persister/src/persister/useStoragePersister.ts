import { useState } from 'react'
import { StoragePersister } from '@tanstack/persister/persister'
import { bindInstanceMethods } from '@tanstack/persister/utils'
import type { StoragePersisterOptions } from '@tanstack/persister/persister'

export function useStoragePersister<TState>(
  options: StoragePersisterOptions<TState>,
) {
  const [persister] = useState(() =>
    bindInstanceMethods(new StoragePersister<TState>(options)),
  )

  persister.setOptions(options)

  return persister
}
