---
title: TanStack Pacer Preact Adapter
id: adapter
---

If you are using TanStack Pacer in a Preact application, we recommend using the Preact Adapter. The Preact Adapter provides a set of easy-to-use hooks on top of the core Pacer utilities. If you find yourself wanting to use the core Pacer classes/functions directly, the Preact Adapter will also re-export everything from the core package.

## Installation

```sh
npm install @tanstack/preact-pacer
```

## Preact Hooks

See the [Preact Functions Reference](./reference/index.md) to see the full list of hooks available in the Preact Adapter.

## Basic Usage

Import a preact specific hook from the Preact Adapter.

```tsx
import { useDebouncedValue } from '@tanstack/preact-pacer'
import { useState } from 'preact/hooks'

const [instantValue, setInstantValue] = useState(0)
const [debouncedValue, debouncer] = useDebouncedValue(instantValue, {
  wait: 1000,
})
```

Or import a core Pacer class/function that is re-exported from the Preact Adapter.

```tsx
import { debounce, Debouncer } from '@tanstack/preact-pacer' // no need to install the core package separately
```

## Option Helpers

If you want a type-safe way to define common options for pacer utilities, TanStack Pacer provides option helpers for each utility. These helpers can be used with Preact hooks.

### Debouncer Options

```tsx
import { useDebouncer } from '@tanstack/preact-pacer'
import { debouncerOptions } from '@tanstack/pacer'

const commonDebouncerOptions = debouncerOptions({
  wait: 1000,
  leading: false,
  trailing: true,
})

const debouncer = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { ...commonDebouncerOptions, key: 'searchDebouncer' }
)
```

### Queuer Options

```tsx
import { useQueuer } from '@tanstack/preact-pacer'
import { queuerOptions } from '@tanstack/pacer'

const commonQueuerOptions = queuerOptions({
  concurrency: 3,
  addItemsTo: 'back',
})

const queuer = useQueuer(
  (item: string) => processItem(item),
  { ...commonQueuerOptions, key: 'itemQueuer' }
)
```

### Rate Limiter Options

```tsx
import { useRateLimiter } from '@tanstack/preact-pacer'
import { rateLimiterOptions } from '@tanstack/pacer'

const commonRateLimiterOptions = rateLimiterOptions({
  limit: 5,
  window: 60000,
  windowType: 'sliding',
})

const rateLimiter = useRateLimiter(
  (data: string) => sendApiRequest(data),
  { ...commonRateLimiterOptions, key: 'apiRateLimiter' }
)
```

## Provider

The Preact Adapter provides a `PacerProvider` component that you can use to provide default options to all instances of pacer utilities within your component tree.

```tsx
import { PacerProvider } from '@tanstack/preact-pacer'

// Set default options for preact-pacer instances
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

The Preact Adapter supports subscribing to state changes in two ways:

### Using the Subscribe Component

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
import { useRateLimiter } from '@tanstack/preact-pacer'

function ApiComponent() {
  const rateLimiter = useRateLimiter(
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
        {({ rejectionCount }) => (
          <div>Rejections: {rejectionCount}</div>
        )}
      </rateLimiter.Subscribe>
    </div>
  )
}
```

### Using the Selector Parameter

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `hook.state` is empty (`{}`) as the selector is empty by default.** You must opt-in to state tracking by providing a selector function.

```tsx
import { useDebouncer } from '@tanstack/preact-pacer'

function SearchComponent() {
  // Default behavior - no reactive state subscriptions
  const debouncer = useDebouncer(
    (query: string) => fetchSearchResults(query),
    { wait: 500 }
  )
  console.log(debouncer.state) // {}

  // Opt-in to track isPending changes
  const debouncer = useDebouncer(
    (query: string) => fetchSearchResults(query),
    { wait: 500 },
    (state) => ({ isPending: state.isPending })
  )
  console.log(debouncer.state.isPending) // Reactive value

  return (
    <input
      onChange={(e) => debouncer.maybeExecute(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

For more details on state management and available state properties, see the individual guide pages for each utility (e.g., [Rate Limiting Guide](../../guides/rate-limiting.md), [Debouncing Guide](../../guides/debouncing.md)).

## Examples

### Debouncer Example

```tsx
import { useDebouncer } from '@tanstack/preact-pacer'

function SearchComponent() {
  const debouncer = useDebouncer(
    (query: string) => {
      console.log('Searching for:', query)
      // Perform search
    },
    { wait: 500 }
  )

  return (
    <input
      onChange={(e) => debouncer.maybeExecute(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### Queuer Example

```tsx
import { useQueuer } from '@tanstack/preact-pacer'

function UploadComponent() {
  const queuer = useQueuer(
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
import { useRateLimiter } from '@tanstack/preact-pacer'

function ApiComponent() {
  const rateLimiter = useRateLimiter(
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


