---
title: TanStack Pacer Solid Adapter
id: adapter
---

If you are using TanStack Pacer in a Solid application, we recommend using the Solid Adapter. The Solid Adapter provides a set of easy-to-use hooks on top of the core Pacer utilities. If you find yourself wanting to use the core Pacer classes/functions directly, the Solid Adapter will also re-export everything from the core package.

## Installation

```sh
npm install @tanstack/solid-pacer
```

## Solid Hooks

See the [Solid Functions Reference](./reference/index.md) to see the full list of hooks available in the Solid Adapter.

## Basic Usage

Import a solid specific hook from the Solid Adapter.

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

## Option Helpers

If you want a type-safe way to define common options for pacer utilities, TanStack Pacer provides option helpers for each utility. These helpers can be used with Solid hooks.

### Debouncer Options

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

### Queuer Options

```tsx
import { createQueuer } from '@tanstack/solid-pacer'
import { queuerOptions } from '@tanstack/pacer'

const commonQueuerOptions = queuerOptions({
  concurrency: 3,
  addItemsTo: 'back',
})

const queuer = createQueuer(
  (item: string) => processItem(item),
  { ...commonQueuerOptions, key: 'itemQueuer' }
)
```

### Rate Limiter Options

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

The Solid Adapter provides a `PacerProvider` component that you can use to provide default options to all instances of pacer utilities within your component tree.

```tsx
import { PacerProvider } from '@tanstack/solid-pacer'

// Set default options for solid-pacer instances
<PacerProvider
  defaultOptions={{
    debouncer: { wait: 1000 },
    queuer: { concurrency: 3 },
    rateLimiter: { limit: 5, window: 60000 },
  }}
>
  <App />
</PacerProvider>
```

All hooks within the provider will automatically use these default options, which can be overridden on a per-hook basis.

## Subscribing to State

The Solid Adapter supports subscribing to state changes in two ways:

### Using the Subscribe Component

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

**Note:** In Solid, the `Subscribe` component provides an accessor (signal) to the selected state. You must call `state()` to access the value.

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

### Using the Selector Parameter

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `hook.state` is empty (`{}`) as the selector is empty by default.** You must opt-in to state tracking by providing a selector function.

**Note:** In Solid, `hook.state` is an accessor (signal). You must call `hook.state()` to access the value.

```tsx
import { createDebouncer } from '@tanstack/solid-pacer'

function SearchComponent() {
  // Default behavior - no reactive state subscriptions
  const debouncer = createDebouncer(
    (query: string) => fetchSearchResults(query),
    { wait: 500 }
  )
  console.log(debouncer.state()) // {}

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

For more details on state management and available state properties, see the individual guide pages for each utility (e.g., [Rate Limiting Guide](../../guides/rate-limiting.md), [Debouncing Guide](../../guides/debouncing.md)).

## Examples

### Debouncer Example

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

### Queuer Example

```tsx
import { createQueuer } from '@tanstack/solid-pacer'

function UploadComponent() {
  const queuer = createQueuer(
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

### Rate Limiter Example

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
