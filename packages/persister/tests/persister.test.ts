import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StoragePersister } from '../src/storage-persister'

describe('createStoragePersister', () => {
  let storage: Storage
  let persister: StoragePersister<any>

  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
    persister = new StoragePersister({
      key: 'test-key',
      storage,
    })
  })

  it('should load state from storage', () => {
    const state = { count: 1 }
    const timestamp = Date.now()
    ;(storage.getItem as any).mockReturnValue(
      JSON.stringify({ state, timestamp }),
    )
    const result = persister.loadState()
    expect(result).toEqual(state)
  })

  it('should return undefined when no state exists', () => {
    ;(storage.getItem as any).mockReturnValue(null)
    const result = persister.loadState()
    expect(result).toBeUndefined()
  })

  it('should handle storage errors when saving', () => {
    const error = new Error('Storage error')
    ;(storage.setItem as any).mockImplementation(() => {
      throw error
    })
    const onSaveStateError = vi.fn()
    persister = new StoragePersister({
      key: 'test-key',
      storage,
      onSaveStateError,
    })
    persister.saveState({ count: 1 })
    expect(onSaveStateError).toHaveBeenCalledWith(error, persister)
  })

  it('should call onSaveState callback when state is saved', () => {
    const onSaveState = vi.fn()
    persister = new StoragePersister({
      key: 'test-key',
      storage,
      onSaveState,
    })
    const state = { count: 1 }
    persister.saveState(state)
    expect(onSaveState).toHaveBeenCalledWith(state, persister)
  })

  it('should call onLoadState callback when state is loaded', () => {
    const onLoadState = vi.fn()
    persister = new StoragePersister({
      key: 'test-key',
      storage,
      onLoadState,
    })
    const state = { count: 1 }
    ;(storage.getItem as any).mockReturnValue(
      JSON.stringify({ state, timestamp: Date.now() }),
    )
    persister.loadState()
    expect(onLoadState).toHaveBeenCalledWith(state, persister)
  })

  it('should respect buster string when loading state', () => {
    persister = new StoragePersister({
      key: 'test-key',
      storage,
      buster: 'v2',
    })
    ;(storage.getItem as any).mockReturnValue(
      JSON.stringify({
        state: { count: 1 },
        timestamp: Date.now(),
        buster: 'v1',
      }),
    )
    const result = persister.loadState()
    expect(result).toBeUndefined()
  })

  it('should respect maxAge when loading state', () => {
    persister = new StoragePersister({
      key: 'test-key',
      storage,
      maxAge: 1000,
    })
    ;(storage.getItem as any).mockReturnValue(
      JSON.stringify({
        state: { count: 1 },
        timestamp: Date.now() - 2000,
      }),
    )
    const result = persister.loadState()
    expect(result).toBeUndefined()
  })

  it('should use custom serializer and deserializer', () => {
    const serializer = vi.fn((data) => JSON.stringify(data))
    const deserializer = vi.fn((data) => JSON.parse(data))
    persister = new StoragePersister({
      key: 'test-key',
      storage,
      serializer,
      deserializer,
    })
    const state = { count: 1 }
    persister.saveState(state)
    expect(serializer).toHaveBeenCalled()
    ;(storage.getItem as any).mockReturnValue(
      JSON.stringify({ state, timestamp: Date.now() }),
    )
    persister.loadState()
    expect(deserializer).toHaveBeenCalled()
  })
})
