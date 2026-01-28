---
id: useBatcher
title: useBatcher
---

# Function: useBatcher()

```ts
function useBatcher<TValue, TSelected>(
   fn, 
   options, 
selector): PreactBatcher<TValue, TSelected>;
```

Defined in: [preact-pacer/src/batcher/useBatcher.ts:159](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L159)

A Preact hook that creates and manages a Batcher instance.

This is a lower-level hook that provides direct access to the Batcher's functionality without
any built-in state management. This allows you to integrate it with any state management solution
you prefer (useState, Redux, Zustand, etc.) by utilizing the onItemsChange callback.

The Batcher collects items and processes them in batches based on configurable conditions:
- Maximum batch size
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute

## State Management and Selector

The hook uses TanStack Store for reactive state management. You can subscribe to state changes
in two ways:

**1. Using `batcher.Subscribe` HOC (Recommended for component tree subscriptions)**

Use the `Subscribe` HOC to subscribe to state changes deep in your component tree without
needing to pass a selector to the hook. This is ideal when you want to subscribe to state
in child components.

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger a re-render
at the hook level, optimizing performance by preventing unnecessary re-renders when irrelevant
state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function or using the `Subscribe` HOC. This prevents unnecessary
re-renders and gives you full control over when your component updates.

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

[`PreactBatcher`](../interfaces/PreactBatcher.md)\<`TValue`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const batcher = useBatcher<number>(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 }
);

// Subscribe to state changes deep in component tree using Subscribe HOC
<batcher.Subscribe selector={(state) => ({ size: state.size })}>
  {({ size }) => (
    <div>Batch Size: {size}</div>
  )}
</batcher.Subscribe>

// Opt-in to re-render when batch size changes at hook level (optimized for displaying queue size)
const batcher = useBatcher<number>(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 },
  (state) => ({
    size: state.size,
    isEmpty: state.isEmpty
  })
);

// Opt-in to re-render when execution metrics change (optimized for stats display)
const batcher = useBatcher<number>(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 },
  (state) => ({
    executionCount: state.executionCount,
    totalItemsProcessed: state.totalItemsProcessed
  })
);

// Opt-in to re-render when processing state changes (optimized for loading indicators)
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

// Access the selected state (will be empty object {} unless selector provided)
const { size, isPending } = batcher.state;
```
