---
id: createBatcher
title: createBatcher
---

# Function: createBatcher()

```ts
function createBatcher<TValue, TSelected>(
   fn, 
   options, 
selector): SolidBatcher<TValue, TSelected>;
```

Defined in: [solid-pacer/src/batcher/createBatcher.ts:144](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L144)

Creates a Solid-compatible Batcher instance for managing batches of items, exposing Solid signals for all stateful properties.

Features:
- Batch processing of items using the provided `fn` function
- Configurable batch size and wait time
- Custom batch processing logic via getShouldExecute
- Event callbacks for monitoring batch operations
- All stateful properties (items, counts, etc.) are exposed as Solid signals for reactivity

The batcher collects items and processes them in batches based on:
- Maximum batch size
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute

## State Management and Selector

The hook uses TanStack Store for reactive state management. You can subscribe to state changes
in two ways:

**1. Using `batcher.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without
needing to pass a selector to the hook. This is ideal when you want to subscribe to state
in child components.

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates
at the hook level, optimizing performance by preventing unnecessary updates when irrelevant
state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function or using the `Subscribe` component. This prevents unnecessary
updates and gives you full control over when your component tracks state changes.

Available state properties:
- `executionCount`: Number of batch executions that have been completed
- `isRunning`: Whether the batcher is currently running (not stopped)
- `items`: Array of items currently queued for batching
- `totalItemsProcessed`: Total number of individual items that have been processed across all batches

## Unmount behavior

By default, the primitive cancels any pending batch when the owning component unmounts.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```tsx
const batcher = createBatcher(fn, {
  maxSize: 10,
  wait: 2000,
  onUnmount: (b) => b.flush()
});
```

Example usage:
```tsx
// Default behavior - no reactive state subscriptions
const batcher = createBatcher(
  (items) => {
    // Process batch of items
    console.log('Processing batch:', items);
  },
  {
    maxSize: 5,
    wait: 2000,
    onExecute: (batcher) => console.log('Batch executed'),
    getShouldExecute: (items) => items.length >= 3
  }
);

// Opt-in to track items or isRunning changes (optimized for UI updates)
const batcher = createBatcher(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 },
  (state) => ({ items: state.items, isRunning: state.isRunning })
);

// Opt-in to track execution metrics changes (optimized for tracking progress)
const batcher = createBatcher(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 },
  (state) => ({
    executionCount: state.executionCount,
    totalItemsProcessed: state.totalItemsProcessed
  })
);

// Add items to batch
batcher.addItem('task1');
batcher.addItem('task2');

// Control the batcher
batcher.stop();  // Pause processing
batcher.start(); // Resume processing

// Access the selected state (will be empty object {} unless selector provided)
const { items, isRunning } = batcher.state();
```

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

(`items`) => `void`

### options

`BatcherOptions`\<`TValue`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`SolidBatcher`](../interfaces/SolidBatcher.md)\<`TValue`, `TSelected`\>
