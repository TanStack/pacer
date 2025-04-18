---
id: useAsyncRateLimiter
title: useAsyncRateLimiter
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Function: useAsyncRateLimiter()

```ts
function useAsyncRateLimiter<TFn, TArgs>(fn, options): object
```

Defined in: [react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:41](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L41)

A low-level React hook that creates an `AsyncRateLimiter` instance to limit how many times an async function can execute within a time window.

This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).

Rate limiting allows an async function to execute up to a specified limit within a time window,
then blocks subsequent calls until the window passes. This is useful for respecting API rate limits,
managing resource constraints, or controlling bursts of async operations.

## Type Parameters

• **TFn** *extends* (...`args`) => `any`

• **TArgs** *extends* `any`[]

## Parameters

### fn

`TFn`

### options

`AsyncRateLimiterOptions`

## Returns

`object`

### getExecutionCount()

```ts
readonly getExecutionCount: () => number;
```

Returns the number of times the function has been executed

#### Returns

`number`

### getRejectionCount()

```ts
readonly getRejectionCount: () => number;
```

Returns the number of times the function has been rejected

#### Returns

`number`

### getRemainingInWindow()

```ts
readonly getRemainingInWindow: () => number;
```

Returns the number of remaining executions allowed in the current window

#### Returns

`number`

### maybeExecute()

```ts
readonly maybeExecute: (...args) => Promise<boolean>;
```

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.
If execution is allowed, waits for any previous execution to complete before proceeding.

#### Parameters

##### args

...`TArgs`

#### Returns

`Promise`\<`boolean`\>

#### Example

```ts
const rateLimiter = new AsyncRateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will execute
await rateLimiter.maybeExecute('arg1', 'arg2');

// Additional calls within the window will be rejected
await rateLimiter.maybeExecute('arg1', 'arg2'); // Rejected
```

### reset()

```ts
readonly reset: () => void;
```

Resets the rate limiter state

#### Returns

`void`

## Example

```tsx
// Basic API call rate limiting
const { maybeExecute } = useAsyncRateLimiter(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  { limit: 5, window: 1000 } // 5 calls per second
);

// With state management
const [data, setData] = useState(null);
const { maybeExecute } = useAsyncRateLimiter(
  async (query) => {
    const result = await searchAPI(query);
    setData(result);
  },
  {
    limit: 10,
    window: 60000, // 10 calls per minute
    onReject: (info) => console.log(`Rate limit exceeded: ${info.nextValidTime - Date.now()}ms until next window`)
  }
);
```
