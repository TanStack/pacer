---
id: asyncRetry
title: asyncRetry
---

# Function: asyncRetry()

```ts
function asyncRetry<TFn>(fn, initialOptions): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-retryer.ts:674](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L674)

Creates a retry-enabled version of an async function. This is a convenience wrapper
around the AsyncRetryer class that returns the execute method.

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Parameters

### fn

`TFn`

The async function to add retry functionality to

### initialOptions

[`AsyncRetryerOptions`](../interfaces/AsyncRetryerOptions.md)\<`TFn`\> = `{}`

Configuration options for the retry behavior

## Returns

A new function that executes the original with retry logic

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

## Example

```typescript
// Define your async function normally
async function fetchData(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Request failed')
  return response.json()
}

// Create retry-enabled function
const fetchWithRetry = asyncRetry(fetchData, {
  maxAttempts: 3,
  backoff: 'exponential',
  baseWait: 1000,
  jitter: 0.1
})

// Call it multiple times
const data1 = await fetchWithRetry('/api/data1')
const data2 = await fetchWithRetry('/api/data2')
```
