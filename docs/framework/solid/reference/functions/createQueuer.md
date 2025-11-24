---
id: createQueuer
title: createQueuer
---

# Function: createQueuer()

```ts
function createQueuer<TValue, TSelected>(
   fn, 
   options, 
selector): SolidQueuer<TValue, TSelected>;
```

Defined in: [solid-pacer/src/queuer/createQueuer.ts:102](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L102)

Creates a Solid-compatible Queuer instance for managing a synchronous queue of items, exposing Solid signals for all stateful properties.

Features:
- Synchronous processing of items using the provided `fn` function
- FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
- Priority queueing via `getPriority` or item `priority` property
- Item expiration and removal of stale items
- Configurable wait time between processing items
- Pause/resume processing
- Callbacks for queue state changes, execution, rejection, and expiration
- All stateful properties (items, counts, etc.) are exposed as Solid signals for reactivity

The queue processes items synchronously in order, with optional delays between each item. When started, it will process one item per tick, with an optional wait time between ticks. You can pause and resume processing with `stop()` and `start()`.

By default, the queue uses FIFO behavior, but you can configure LIFO or double-ended queueing by specifying the position when adding or removing items.

## State Management and Selector

The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
to specify which state changes will trigger a re-render, optimizing performance by preventing
unnecessary re-renders when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary re-renders and gives you
full control over when your component updates. Only when you provide a selector will the
component re-render when the selected state values change.

Available state properties:
- `executionCount`: Number of items that have been processed
- `isRunning`: Whether the queuer is currently running (not stopped)
- `items`: Array of items currently queued for processing
- `rejectionCount`: Number of items that were rejected (expired or failed validation)

Example usage:
```tsx
// Default behavior - no reactive state subscriptions
const queue = createQueuer(
  (item) => {
    // process item synchronously
    console.log('Processing', item);
  },
  {
    started: true, // Start processing immediately
    wait: 1000,    // Process one item every second
    getPriority: (item) => item.priority // Process higher priority items first
  }
);

// Opt-in to re-render when items or isRunning changes (optimized for UI updates)
const queue = createQueuer(
  (item) => console.log('Processing', item),
  { started: true, wait: 1000 },
  (state) => ({ items: state.items, isRunning: state.isRunning })
);

// Opt-in to re-render when execution metrics change (optimized for tracking progress)
const queue = createQueuer(
  (item) => console.log('Processing', item),
  { started: true, wait: 1000 },
  (state) => ({
    executionCount: state.executionCount,
    rejectionCount: state.rejectionCount
  })
);

// Add items to process - they'll be handled automatically
queue.addItem('task1');
queue.addItem('task2');

// Control the scheduler
queue.stop();  // Pause processing
queue.start(); // Resume processing

// Access the selected state (will be empty object {} unless selector provided)
const { items, isRunning } = queue.state();
```

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

(`item`) => `void`

### options

`QueuerOptions`\<`TValue`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`SolidQueuer`](../../interfaces/SolidQueuer.md)\<`TValue`, `TSelected`\>
