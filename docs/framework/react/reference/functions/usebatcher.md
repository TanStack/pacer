---
id: useBatcher
title: useBatcher
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Function: useBatcher()

```ts
function useBatcher<TValue, TSelected>(
   fn, 
   options, 
selector?): ReactBatcher<TValue, TSelected>
```

Defined in: [react-pacer/src/batcher/useBatcher.ts:113](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L113)

A React hook that creates and manages a Batcher instance.

This is a lower-level hook that provides direct access to the Batcher's functionality without
any built-in state management. This allows you to integrate it with any state management solution
you prefer (useState, Redux, Zustand, etc.) by utilizing the onItemsChange callback.

The Batcher collects items and processes them in batches based on configurable conditions:
- Maximum batch size
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute

## State Management and Selector

The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
to specify which state changes will trigger a re-render, optimizing performance by preventing
unnecessary re-renders when irrelevant state changes occur.

**By default, all state changes will trigger a re-render.** To optimize performance, you can
provide a selector function that returns only the specific state values your component needs.
The component will only re-render when the selected values change.

Available state properties:
- `executionCount`: Number of batch executions that have been completed
- `isEmpty`: Whether the batcher has no items to process
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `isRunning`: Whether the batcher is active and will process items automatically
- `items`: Array of items currently queued for batch processing
- `size`: Number of items currently in the batch queue
- `status`: Current processing status ('idle' | 'pending')
- `totalItemsProcessed`: Total number of items processed across all batches

## Type Parameters

• **TValue**

• **TSelected** = `BatcherState`\<`TValue`\>

## Parameters

### fn

(`items`) => `void`

### options

`BatcherOptions`\<`TValue`\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

[`ReactBatcher`](../../interfaces/reactbatcher.md)\<`TValue`, `TSelected`\>

## Example

```tsx
// Default behavior - re-renders on any state change
const batcher = useBatcher<number>(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 }
);

// Only re-render when batch size changes (optimized for displaying queue size)
const batcher = useBatcher<number>(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 },
  (state) => ({
    size: state.size,
    isEmpty: state.isEmpty
  })
);

// Only re-render when execution metrics change (optimized for stats display)
const batcher = useBatcher<number>(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 },
  (state) => ({
    executionCount: state.executionCount,
    totalItemsProcessed: state.totalItemsProcessed
  })
);

// Only re-render when processing state changes (optimized for loading indicators)
const batcher = useBatcher<number>(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 },
  (state) => ({
    isPending: state.isPending,
    isRunning: state.isRunning,
    status: state.status
  })
);

// Example with custom state management and batching
const [items, setItems] = useState([]);

const batcher = useBatcher<number>(
  (items) => console.log('Processing batch:', items),
  {
    maxSize: 5,
    wait: 2000,
    onItemsChange: (batcher) => setItems(batcher.peekAllItems()),
    getShouldExecute: (items) => items.length >= 3
  }
);

// Add items to batch - they'll be processed when conditions are met
batcher.addItem(1);
batcher.addItem(2);
batcher.addItem(3); // Triggers batch processing

// Control the batcher
batcher.stop();  // Pause batching
batcher.start(); // Resume batching

// Access the selected state
const { size, isPending } = batcher.state;
```
