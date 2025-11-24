# TanStack Pacer `createQueuedSignal` Example

This is a simple example of TanStack Pacer's `createQueuedSignal` hook, which manages a queue with built-in signal-based state management.

## Features Demonstrated

- Creating a queuer with managed state using `createQueuedSignal`
- Adding and processing items in a queue
- Controlling queue processing (start/stop/reset/clear)
- Reactive state tracking with optional selectors
- Automatic state updates through Solid's reactivity

## Key Differences from React

- Uses `createQueuedSignal` instead of `useQueuedState`
- Returns signals that need to be called as functions: `queueItems()`
- Uses Solid's `createSignal` for local state management
- Event handlers use `onInput` instead of `onChange`

The `createQueuedSignal` hook combines a queuer instance with Solid's reactive system to automatically track queue items as a signal, making it easy to build reactive UIs around queue state.
