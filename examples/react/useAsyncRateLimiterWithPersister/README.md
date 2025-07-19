# useAsyncRateLimiterWithPersister Example

This example demonstrates how to use the `useAsyncRateLimiter` hook with persistence to maintain state across page refreshes.

## Features

- Async rate limiting with fixed and sliding windows
- Local storage persistence to retain state on page refresh
- Search functionality with rate-limited API calls
- Error handling and state management

## Running the Example

```bash
npm install
npm run dev
```

## Key Concepts

- **Persistence**: Uses `useStoragePersister` to save and restore async rate limiter state
- **State Selector**: Uses `(state) => state` to subscribe to the entire state for persistence
- **Local Storage**: Persists state in localStorage with 1-minute expiration
- **Async Operations**: Demonstrates rate limiting for async API calls
