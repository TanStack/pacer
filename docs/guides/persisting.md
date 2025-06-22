---
title: Persisting State Guide
id: persisting
---

Persisting (saving and loading state) would not seem to be in the original scope of TanStack Pacer, but each of the utilities in TanStack Pacer needed to be written with persistence in mind in order to be useful for longer running tasks or back-end API integrations. So we built the persistence features in a way that was standalone and could be used with either the TanStack Pacer utilities, or as any other simple implementations like a `useLocalStorageState` hook.

## Understanding Persisters

At its core, a persister is responsible for saving and loading state. TanStack Pacer provides two types of persisters to handle different persistence needs:

The `Persister` class is designed for synchronous operations, making it perfect for client-side storage like `localStorage` or `sessionStorage`. It provides immediate access to state, which is ideal for most browser-based applications where you need to maintain state across page reloads or browser sessions.

For more complex scenarios, particularly when working with external storage systems like databases or Redis, the `AsyncPersister` class offers a promise-based approach to state management. This is especially useful in server-side applications or when you need to share state across multiple instances of your application.

## Storage Persister (Client-Side)

The `StoragePersister` is TanStack Pacer's built-in solution for browser-based state persistence. It wraps the browser's storage APIs (`localStorage` or `sessionStorage`) with additional features like version control, state expiration, and error handling.

Here's a practical example of using a `StoragePersister` with a rate limiter in a React application:

```tsx
import { useState } from 'react'
import { useRateLimiter } from '@tanstack/react-pacer/rate-limiter'
import { useStoragePersister } from '@tanstack/react-pacer/persister'

function Counter() {
  const [instantCount, setInstantCount] = useState(0)
  const [limitedCount, setLimitedCount] = useState(0)

  // Create a rate limiter that persists its state
  const rateLimiter = useRateLimiter(setLimitedCount, {
    limit: 5,
    window: 5000, // 5 seconds
    onReject: (rateLimiter) => {
      console.log('Rate limit exceeded. Try again in', rateLimiter.getMsUntilNextWindow(), 'ms')
    },
    // Configure the persister to save state to localStorage
    persister: useStoragePersister({
      key: 'my-rate-limiter',
      storage: localStorage,
      maxAge: 1000 * 60, // State expires after 1 minute
      buster: 'v1', // Version control for state structure
    }),
  })

  function increment() {
    setInstantCount((c) => {
      const newCount = c + 1
      rateLimiter.maybeExecute(newCount)
      return newCount
    })
  }

  return (
    <div>
      <p>Instant Count: {instantCount}</p>
      <p>Rate Limited Count: {limitedCount}</p>
      <p>Remaining in Window: {rateLimiter.getRemainingInWindow()}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={() => rateLimiter.reset()}>Reset</button>
    </div>
  )
}
```

In this example, the rate limiter's state (including execution count, rejection count, and execution times) is automatically persisted to localStorage. This means that even if the user refreshes the page or closes and reopens the browser, the rate limit will be maintained. The `maxAge` option ensures that the state doesn't become stale, and the `buster` option allows you to invalidate old state when you make breaking changes to your application.

### Storage Persister Callbacks

The `StoragePersister` utility provides several callback functions that help you customize and debug state persistence:

- `onSaveState`: Called whenever state is successfully saved to storage. Useful for logging or analytics.
- `onLoadState`: Called when state is loaded from storage. Helpful for debugging state restoration.
- `onSaveStateError`: Called if there's an error saving state. Use this to handle storage errors gracefully. This can be useful for handling storage quota limits (localStorage is limited to 5MB), or other storage errors.
- `onLoadStateError`: Called if there's an error loading state. Useful for fallback behavior when state can't be restored/parsed.
- `serialize`: Custom function to transform state before saving to storage. Useful for complex state objects, custom serialization for Dates, etc.
- `deserialize`: Custom function to transform loaded data back into state. Should match your serialize functionality.

### Framework Integrations

Several convienient hooks are provided for persisting state in each JavaScript framework that TanStack Pacer supports. You may find hooks like `useStoragePersister` or `useLocalStorageState` useful.

## Creating Custom Persisters

While the built-in `StoragePersister` covers many use cases, you might need to integrate with custom storage solutions or add specific functionality. TanStack Pacer makes this easy by providing base classes that you can extend.

For synchronous operations, you can extend the `Persister` class:

```ts
import { Persister } from '@tanstack/pacer'

class CustomPersister<TState> extends Persister<TState> {
  constructor(key: string) {
    super(key)
  }

  loadState(): TState | undefined {
    // Load state from your storage
    const stored = customStorage.getItem(this.key)
    return stored ? JSON.parse(stored) : undefined
  }

  saveState(state: TState): void {
    // Save state to your storage
    customStorage.setItem(this.key, JSON.stringify(state))
  }
}
```

### Async Persister (Client-Side or Server-Side)

When working with asynchronous storage systems, the `AsyncPersister` class provides a foundation for building custom async persisters. This is particularly useful in Node.js backend APIs where you need to share rate limiting state across multiple server instances or maintain state in a database.

Here's an example of implementing a Redis-based persister for distributed rate limiting:

```ts
import { AsyncPersister } from '@tanstack/pacer'
import { createClient } from 'redis'

class RedisPersister<TState> extends AsyncPersister<TState> {
  private client: ReturnType<typeof createClient>

  constructor(key: string, redisUrl: string) {
    super(key)
    this.client = createClient({ url: redisUrl })
    this.client.connect()
  }

  async loadState(): Promise<TState | undefined> {
    const stored = await this.client.get(this.key)
    if (!stored) return undefined
    
    const { state, timestamp, buster } = JSON.parse(stored)
    const now = Date.now()
    
    // Check if state is expired (e.g., 1 hour old)
    if (now - timestamp > 1000 * 60 * 60) {
      await this.client.del(this.key)
      return undefined
    }
    
    return state
  }

  async saveState(state: TState): Promise<void> {
    await this.client.set(
      this.key,
      JSON.stringify({
        state,
        timestamp: Date.now(),
        buster: 'v1' // Version control for state structure
      })
    )
  }

  async cleanup(): Promise<void> {
    await this.client.quit()
  }
}

// Usage in an Express API
import express from 'express'
import { AsyncRateLimiter } from '@tanstack/pacer'

const app = express()
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// Create a rate limiter for API endpoints
const apiRateLimiter = new AsyncRateLimiter(
  async (req, res) => {
    // Your API endpoint logic here
    res.json({ success: true })
  },
  {
    limit: 100,
    window: 60 * 1000, // 100 requests per minute
    persister: new RedisPersister('api-rate-limit', redisUrl)
  }
)

app.get('/api/endpoint', async (req, res) => {
  const success = await apiRateLimiter.maybeExecute(req, res)
  if (!success) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: apiRateLimiter.getMsUntilNextWindow()
    })
  }
})
```

This implementation demonstrates how to use `AsyncPersister` in a backend context with Redis, which is ideal for distributed rate limiting. The key features include:

- Automatic state expiration using timestamps
- Version control through the `buster` field
- Proper connection management with cleanup methods
- Integration with Express
- Distributed rate limiting across multiple server instances

The key advantage of using async persisters in a backend context is that they allow you to share rate limiting state across multiple server instances. This is crucial for maintaining consistent rate limits in a clustered environment, where multiple servers might be handling requests for the same client.

