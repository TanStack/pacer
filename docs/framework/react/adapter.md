---
title: TanStack Pacer React Adapter
id: adapter
---

In a React application, use the React Adapter. Its hooks wrap the core Pacer utilities with lifecycle cleanup and reactive state. The adapter also re-exports everything from the core package, so you can import the plain classes and functions from the same place.

## Installation

```sh
npm install @tanstack/react-pacer
```

## React hooks

See the [React Functions Reference](./reference/index.md) for the full list of hooks in the React Adapter.

## Basic usage

Import a React-specific hook from the React Adapter.

```tsx
import { useDebouncedValue } from '@tanstack/react-pacer'

const [instantValue, instantValueRef] = useState(0)
const [debouncedValue, debouncer] = useDebouncedValue(instantValue, {
  wait: 1000,
})
```

Or import a core Pacer class/function that is re-exported from the React Adapter.

```tsx
import { debounce, Debouncer } from '@tanstack/react-pacer' // no need to install the core package separately
```

## Option helpers

Option helpers define shared options with full type checking, so you can declare them once and reuse them across hooks.

### Debouncer options

```tsx
import { useDebouncer } from '@tanstack/react-pacer'
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

### Async queuer options

```tsx
import { useAsyncQueuer } from '@tanstack/react-pacer'
import { asyncQueuerOptions } from '@tanstack/pacer'

const commonAsyncQueuerOptions = asyncQueuerOptions({
  concurrency: 3,
  addItemsTo: 'back',
})

const queuer = useAsyncQueuer(
  async (item: string) => processItem(item),
  { ...commonAsyncQueuerOptions, key: 'itemQueuer' }
)
```

### Rate limiter options

```tsx
import { useRateLimiter } from '@tanstack/react-pacer'
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

The `PacerProvider` component sets default options for every Pacer utility instance in its component tree.

```tsx
import { PacerProvider } from '@tanstack/react-pacer'

// Set default options for react-pacer instances
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

The React adapter supports subscribing to state changes in two ways:

### Using the Subscribe component

Use the `Subscribe` component to read state deep in the component tree without passing a selector to the hook.

```tsx
import { useRateLimiter } from '@tanstack/react-pacer'

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

### Using the selector parameter

The `selector` parameter controls which state changes trigger reactive updates. State you do not select never causes an update.

Without a selector, `hook.state` is an empty object (`{}`). Pass a selector function to opt in to state tracking.

```tsx
import { useDebouncer } from '@tanstack/react-pacer'

function SearchComponent() {
  // Default behavior - no reactive state subscriptions
  const untrackedDebouncer = useDebouncer(
    (query: string) => fetchSearchResults(query),
    { wait: 500 }
  )
  console.log(untrackedDebouncer.state) // {}

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

### Debouncer example

```tsx
import { useDebouncer } from '@tanstack/react-pacer'

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

### Async queuer example

```tsx
import { useAsyncQueuer } from '@tanstack/react-pacer'

function UploadComponent() {
  const queuer = useAsyncQueuer(
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
import { useRateLimiter } from '@tanstack/react-pacer'

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
