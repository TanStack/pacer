# TanStack Pacer - Cross-Batch Deduplication Example

This example demonstrates the `trackProcessedKeys` feature in TanStack Pacer, which prevents duplicate processing **across batches**.

## What This Example Shows

- **Cross-Batch Deduplication**: Items that have been processed won't be processed again until cleared
- **Processed Keys Tracking**: Similar to `RateLimiter.executionTimes`, tracks which keys have been processed
- **Custom Key Extraction**: Use `getItemKey` to define what makes an item unique
- **Memory Management**: `maxTrackedKeys` limits memory usage with FIFO eviction
- **Skip Callback**: Track when items are skipped with `onSkip`
- **State Persistence**: Use `initialState` to restore processed keys from storage

## Use Case

In applications where the same data might be requested multiple times (e.g., no-code tools, component-based UIs), you want to:

- **Prevent redundant API calls** - If user-123's data was fetched, don't fetch it again
- **Reduce server load** - Avoid duplicate processing even across different batch cycles
- **Improve performance** - Skip items that have already been handled

This is similar to request deduplication in TanStack Query, but at the batching level.

## Running the Example

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3007

## Key Configuration

```typescript
const batcher = useBatcher(
  (userIds: string[]) => {
    // API call to fetch users
    console.log("Fetching users:", userIds);
  },
  {
    maxSize: 5,
    wait: 2000,
    trackProcessedKeys: true,       // Enable cross-batch deduplication
    getItemKey: (userId) => userId, // Define uniqueness
    maxTrackedKeys: 100,            // Limit memory (FIFO eviction)
    onSkip: (item) => {
      console.log(`Skipped (already processed): ${item}`);
    },
  }
);
```

## Try It Out

1. Click "Fetch user-123" - It will be added to the batch
2. Wait for the batch to process (or click "Flush Batch Now")
3. Click "Fetch user-123" again - It will be **skipped** because it was already processed!
4. Watch the "Items Skipped" counter increase
5. Click "Clear Processed Keys" to allow re-processing

## API Reference

### Options

- `trackProcessedKeys: boolean` - Enable cross-batch deduplication (default: false)
- `getItemKey: (item) => string | number` - Extract unique key from item
- `maxTrackedKeys: number` - Maximum keys to track (default: 1000, FIFO eviction)
- `onSkip: (item, batcher) => void` - Callback when an item is skipped

### Methods

- `hasProcessedKey(key)` - Check if a key has been processed
- `peekProcessedKeys()` - Get a copy of all processed keys
- `clearProcessedKeys()` - Clear the processed keys history

### State

- `processedKeys: Array<string | number>` - Keys that have been processed
- `skippedCount: number` - Number of items skipped due to deduplication
