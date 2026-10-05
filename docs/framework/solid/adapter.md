---
title: TanStack Pacer Solid Adapter
id: adapter
---

In a Solid application, use the Solid Adapter. Its hooks wrap the core Pacer utilities with lifecycle cleanup and reactive state. The adapter also re-exports everything from the core package, so you can import the plain classes and functions from the same place.

## Installation

```sh
npm install @tanstack/solid-pacer
```

## Solid hooks

See the [Solid Functions Reference](./reference/index.md) for the full list of hooks in the Solid Adapter.

## Basic usage

Import a Solid-specific hook from the Solid Adapter.

```tsx
import { createDebouncedValue } from '@tanstack/solid-pacer'
import { createSignal } from 'solid-js'

const [instantValue, setInstantValue] = createSignal(0)
const [debouncedValue, debouncer] = createDebouncedValue(instantValue, {
  wait: 1000,
})
```

Or import a core Pacer class/function that is re-exported from the Solid Adapter.

```tsx
import { debounce, Debouncer } from '@tanstack/solid-pacer' // no need to install the core package separately
```

## Option helpers

Option helpers define shared options with full type checking, so you can declare them once and reuse them across hooks.

### Debouncer options

```tsx
import { createDebouncer } from '@tanstack/solid-pacer'
import { debouncerOptions } from '@tanstack/pacer'

const commonDebouncerOptions = debouncerOptions({
  wait: 1000,
  leading: false,
  trailing: true,
})

const debouncer = createDebouncer(
  (query: string) => fetchSearchResults(query),
  { ...commonDebouncerOptions, key: 'searchDebouncer' }
)
```

### Async queuer options

```tsx
import { createAsyncQueuer } from '@tanstack/solid-pacer'
import { asyncQueuerOptions } from '@tanstack/pacer'

const commonAsyncQueuerOptions = asyncQueuerOptions({
  concurrency: 3,
  addItemsTo: 'back',
})

const queuer = createAsyncQueuer(
  async (item: string) => processItem(item),
  { ...commonAsyncQueuerOptions, key: 'itemQueuer' }
)
```

### Rate limiter options

```tsx
import { createRateLimiter } from '@tanstack/solid-pacer'
import { rateLimiterOptions } from '@tanstack/pacer'

const commonRateLimiterOptions = rateLimiterOptions({
  limit: 5,
  window: 60000,
  windowType: 'sliding',
})

const rateLimiter = createRateLimiter(
  (data: string) => sendApiRequest(data),
  { ...commonRateLimiterOptions, key: 'apiRateLimiter' }
)
```

## Provider

The `PacerProvider` component sets default options for every Pacer utility instance in its component tree.

```tsx
import { PacerProvider } from '@tanstack/solid-pacer'

// Set default options for solid-pacer instances
<PacerProvider
  defaultOptions={{
    debouncer: { wait: 1000 },
    asyncQueuer: { concurrency: 3 },
    rateLimiter: { limit: 5, window: 60000 },
  }}
>
  <App />
</PacerProvider>
```

Hooks inside the provider use these defaults. Options passed to an individual hook override them.

## Subscribing to state

The Solid Adapter supports subscribing to state changes in two ways:

### Using the Subscribe component

Use the `Subscribe` component to read state deep in the component tree without passing a selector to the hook.

In Solid, the `Subscribe` component provides an accessor (signal) to the selected state, so call `state()` to read the value.

```tsx
import { createRateLimiter } from '@tanstack/solid-pacer'

function ApiComponent() {
  const rateLimiter = createRateLimiter(
    (data: string) => {
      return fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ data }),
      })
    },
    { limit: 5, window: 60000 }
  )

  return (
    <div>
      <button onClick={() => rateLimiter.maybeExecute('some data')}>
        Submit
      </button>
      
      <rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount })}>
        {(state) => (
          <div>Rejections: {state().rejectionCount}</div>
        )}
      </rateLimiter.Subscribe>
    </div>
  )
}
```

### Using the selector parameter

The `selector` parameter controls which state changes trigger reactive updates. State you do not select never causes an update.

Without a selector, `hook.state` is an empty object (`{}`). Pass a selector function to opt in to state tracking.

In Solid, `hook.state` is an accessor (signal), so call `hook.state()` to read the value.

```tsx
import { createDebouncer } from '@tanstack/solid-pacer'

function SearchComponent() {
  // Default behavior - no reactive state subscriptions
  const untrackedDebouncer = createDebouncer(
    (query: string) => fetchSearchResults(query),
    { wait: 500 }
  )
  console.log(untrackedDebouncer.state()) // {}

  // Opt-in to track isPending changes
  const debouncer = createDebouncer(
    (query: string) => fetchSearchResults(query),
    { wait: 500 },
    (state) => ({ isPending: state.isPending })
  )
  console.log(debouncer.state().isPending) // Reactive value

  return (
    <input
      onInput={(e) => debouncer.maybeExecute(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

For more details on state management and available state properties, see the individual guide pages for each utility (e.g., [Rate Limiting Guide](./guides/rate-limiting.md), [Debouncing Guide](./guides/debouncing.md)).

## Examples

### Debouncer example

```tsx
import { createDebouncer } from '@tanstack/solid-pacer'

function SearchComponent() {
  const debouncer = createDebouncer(
    (query: string) => {
      console.log('Searching for:', query)
      // Perform search
    },
    { wait: 500 }
  )

  return (
    <input
      onInput={(e) => debouncer.maybeExecute(e.currentTarget.value)}
      placeholder="Search..."
    />
  )
}
```

### Async queuer example

```tsx
import { createAsyncQueuer } from '@tanstack/solid-pacer'

function UploadComponent() {
  const queuer = createAsyncQueuer(
    async (file: File) => {
      await uploadFile(file)
    },
    { concurrency: 3 }
  )

  const handleFileSelect = (files: FileList) => {
    Array.from(files).forEach((file) => {
      queuer.addItem(file)
    })
  }

  return (
    <input
      type="file"
      multiple
      onChange={(e) => {
        if (e.target.files) {
          handleFileSelect(e.target.files)
        }
      }}
    />
  )
}
```

### Rate limiter example

```tsx
import { createRateLimiter } from '@tanstack/solid-pacer'

function ApiComponent() {
  const rateLimiter = createRateLimiter(
    (data: string) => {
      return fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ data }),
      })
    },
    {
      limit: 5,
      window: 60000,
      windowType: 'sliding',
      onReject: () => {
        alert('Rate limit reached. Please try again later.')
      },
    }
  )

  const handleSubmit = () => {
    const remaining = rateLimiter.getRemainingInWindow()
    if (remaining > 0) {
      rateLimiter.maybeExecute('some data')
    }
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

## Reactive options

Use property getters to read Solid signals or props in an options object:

```tsx
const [wait, setWait] = createSignal(300)
const debouncer = createDebouncer(save, {
  get wait() {
    return wait()
  },
})

setWait(600)
```

An options accessor supports the same behavior:

```tsx
const debouncer = createDebouncer(save, () => ({ wait: wait() }))
```

The adapter reads getters and accessors in a reactive computation. It initializes the utility immediately, then updates the same utility through `setOptions` when a dependency changes. This applies to all synchronous and asynchronous create functions and their signal and value helpers. Provider defaults are read in the same computation, and local options override them.

Reading a signal before passing the options, such as `{ wait: wait() }`, produces a snapshot. Assigning to an ordinary object property does not trigger an update. Use a getter or accessor for reactive values. Option reads are shallow: to track a nested configuration, build that configuration inside a getter or accessor. Callbacks and function-valued core options remain functions and are not invoked when options are resolved.

Updates preserve the utility, store, pending work, and queued items. Changing `wait` does not reschedule an existing timer. Setting `enabled` to `false` still applies the utility's normal cancellation behavior. Construction options such as `key`, `initialState`, and `initialItems` apply only when the utility is created. Use `start()` and `stop()` to change running queues.

Updates follow `setOptions` merge semantics. If an accessor omits a previously supplied field, the provider default replaces it when one exists; otherwise, its previous value remains. Return `undefined` explicitly to clear an optional field. For example, `onUnmount: undefined` restores default cleanup. Disposal uses the latest `onUnmount` callback. The utility's `options` property exposes its current core options, including manual `setOptions` updates.
