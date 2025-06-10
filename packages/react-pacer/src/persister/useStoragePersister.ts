import { useState } from 'react'
import { StoragePersister } from '@tanstack/pacer/persister'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { StoragePersisterOptions } from '@tanstack/pacer/persister'

export function useStoragePersister<TState>(
  options: StoragePersisterOptions<TState>,
) {
  const [persister] = useState(() =>
    bindInstanceMethods(new StoragePersister<TState>(options)),
  )

  persister.setOptions(options)

  return persister
}
