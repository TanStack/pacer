---
title: Octane Async Retrying Guide
id: async-retrying
---

Retrying runs an async operation again after it fails. It can make transient failures less visible to users, but it can also repeat side effects and increase load on an unhealthy service.

> [!NOTE]
> `AsyncRetryer` is an alpha API and may change before 1.0. Its current design also supports the retry behavior inside Pacer's other async utilities.

Retrying is the exception among these framework guides: TanStack Pacer does not provide a Octane-specific retry primitive. The adapter re-exports the public `asyncRetry` function and `AsyncRetryer` class, so this guide uses those APIs.

If TanStack Query already owns the request, use its retry support so one system controls request state and cancellation.

## Decide whether retrying is safe

Retry only errors that are likely to succeed later, such as a temporary network failure, a rate-limit response, or some server errors. Validation, authentication, permission, and most other client errors usually need a code or user-input change instead.

`AsyncRetryer` retries every thrown error. It does not provide a `shouldRetry` predicate. Make the wrapped function throw only for retriable outcomes:

```ts
async function loadUser(id: string) {
  const response = await fetch(`/api/users/${id}`)

  if (response.status === 429 || response.status >= 500) {
    throw new Error(`Temporary failure: ${response.status}`)
  }

  if (!response.ok) {
    return { ok: false as const, status: response.status }
  }

  return { ok: true as const, user: await response.json() }
}
```

Also consider whether repeating the operation is idempotent. Reads are commonly safe. Writes may create duplicate records, charges, messages, or other side effects when the first response is lost after the server completes the operation. Use idempotency keys or server-side deduplication before retrying such writes.

## Quick start

`asyncRetry` creates one retryer and returns its bound execution function:

```ts
import { asyncRetry } from '@tanstack/octane-pacer'

const loadUserWithRetry = asyncRetry(loadUser, {
  maxAttempts: 3,
  baseWait: 1000,
  jitter: 0.2,
})

try {
  const result = await loadUserWithRetry('123')
  console.log(result)
} catch (error) {
  console.error('All attempts failed:', error)
}
```

The defaults are three total attempts, exponential backoff from 1000 milliseconds, no maximum delay, no jitter, and `throwOnError: 'last'`.

The returned function can be reused sequentially. It owns one `AsyncRetryer`, so starting a new call while an earlier call is active aborts the earlier retry flow. When calls may overlap, create a retryer per call or use another utility that manages concurrency:

```ts
import { AsyncRetryer } from '@tanstack/octane-pacer'

async function loadOneUser(id: string) {
  const retryer = new AsyncRetryer(loadUser, { maxAttempts: 3 })
  return retryer.execute(id)
}
```

## Ownership and cancellation

`AsyncRetryer` is a core class, so it does not automatically join adapter cleanup. Prefer the async scheduling utilities with `asyncRetryerOptions` when the operation belongs to a component. They expose the same retry settings and participate in framework teardown.

For a manually owned retryer, call `abort()` from the owner's cleanup. Use a fresh instance for independent overlapping calls. Do not create a new retryer every time a component renders.

See the [core retrying guide](../../../guides/async-retrying.md) for backoff, jitter, failure handling, and abort signals.
