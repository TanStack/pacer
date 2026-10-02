---
title: Persist Pacer state
id: persistence
---

Use your application's storage to save the Pacer state you need across reloads. Restore that data when you create the utility instance.

## Restore waiting queue items

This example stores a queue of strings in `localStorage`. Call `createPersistentQueue` once from your client lifecycle, after browser storage is available.

```ts
import { Queuer } from '@tanstack/pacer/queuer'

function createPersistentQueue(processItem: (item: string) => void) {
  const storageKey = 'pacer-waiting-items-v1'

  function loadItems(): Array<string> {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem(storageKey) ?? '[]',
      )
      return Array.isArray(value) &&
        value.every((item) => typeof item === 'string')
        ? value
        : []
    } catch {
      return []
    }
  }

  const queuer = new Queuer(processItem, {
    initialItems: loadItems(),
    started: false,
    wait: 1000,
    onItemsChange: (instance) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify(instance.peekAllItems()),
        )
      } catch (error) {
        console.error('Could not save waiting queue items', error)
      }
    },
  })

  queuer.start()
  return queuer
}

const queuer = createPersistentQueue((item) => console.log(item))
queuer.addItem('Process after reload if still waiting')

// Call from your component or application cleanup to preserve waiting items.
// queuer.stop()
```

The queue removes an item before it calls `processItem`. This saves waiting items only. For work that must survive a crash during processing, use durable job storage with acknowledgements and idempotent handlers.

In framework adapters, pass restored items through `initialItems` and save changes through `onItemsChange`. Load the items before creating the instance; later option updates do not reinitialize its state. Use the adapter's lifecycle cleanup to stop processing when the owner is destroyed.

If items expire, preserve their original timestamps as well. Restoring through `initialItems` assigns new timestamps and starts their expiration period again.

## Restore a rate-limit window

Save a rate limiter's `store.state.executionTimes` in `onExecute`. Validate that the saved timestamps are finite numbers before restoring them through `initialState: { executionTimes }`. Keep the same `limit`, `window`, and `windowType`, or discard the stored window when that configuration changes.

Use a storage key scoped to the operation and user. Browser storage does not coordinate quotas across tabs, devices, or servers. Enforce shared API limits on the server.

For asynchronous utilities, save completed execution timestamps or waiting items. Do not restore active promises, retry timers, abort controllers, or transient running state.

See the [queuing guide](./queuing.md) and [rate limiting guide](./rate-limiting.md) for framework-specific APIs.
