# useRateLimiterWithPersister Example

This example demonstrates how to use the `useRateLimiter` hook with persistence to maintain state across page refreshes.

## Features

- Rate limiting with fixed and sliding windows
- Local storage persistence to retain state on page refresh
- Multiple examples showing different use cases
- Real-time state monitoring

## Running the Example

```bash
npm install
npm run dev
```

## Key Concepts

- **Persistence**: Uses `useStoragePersister` to save and restore rate limiter state
- **State Selector**: Uses `(state) => state` to subscribe to the entire state for persistence
- **Local Storage**: Persists state in localStorage with 1-minute expiration
