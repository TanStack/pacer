# useQueuerWithPersister Example

This example demonstrates how to use the `useQueuer` hook with persistence to maintain state across page refreshes.

## Features

- Queue management with automatic processing
- Session storage persistence to retain state on page refresh
- Multiple examples showing different use cases
- Real-time state monitoring

## Running the Example

```bash
npm install
npm run dev
```

## Key Concepts

- **Persistence**: Uses `useStoragePersister` to save and restore queue state
- **State Selector**: Uses `(state) => state` to subscribe to the entire state for persistence
- **Session Storage**: Persists state in sessionStorage with 1-minute expiration
