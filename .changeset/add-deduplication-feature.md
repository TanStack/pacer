---
'@tanstack/pacer': minor
---

Add cross-batch/cross-execution deduplication support to Batcher and Queuer

This feature extends the existing `deduplicateItems` option to track processed items across batch/execution cycles. When enabled, items that have already been processed will be automatically skipped.

### Enhanced Options

- `deduplicateItems: boolean` - Now prevents duplicates **both within and across batches** (default: false)
- `deduplicateStrategy: 'keep-first' | 'keep-last'` - Only affects in-batch duplicates (default: 'keep-first')
- `getItemKey: (item) => string | number` - Extract unique key from item
- `maxTrackedKeys: number` - Maximum keys to track with FIFO eviction (default: 1000)
- `onDuplicate: (newItem, existingItem?, instance) => void` - Called for both in-batch and cross-batch duplicates

### New Methods

- `hasProcessedKey(key)` - Check if a key has been processed
- `peekProcessedKeys()` - Get a copy of all processed keys
- `clearProcessedKeys()` - Clear the processed keys history

### New State Properties

- `processedKeys: Array<string | number>` - Keys that have been processed (similar to RateLimiter's executionTimes)

### Behavior

When `deduplicateItems` is enabled:

1. **In-batch duplicates**: Merged based on `deduplicateStrategy` ('keep-first' or 'keep-last')
2. **Cross-batch duplicates**: Skipped entirely (already processed)
3. `onDuplicate` called with `existingItem` for in-batch, `undefined` for cross-batch

### Use Case

Prevents redundant processing when the same data is requested multiple times:

- API calls: Don't fetch user-123 if it was already fetched
- No-code tools: Multiple components requesting the same resource
- Event processing: Skip events that have already been handled

Similar to request deduplication in TanStack Query, but at the batching/queuing level.

### Persistence Support

The `processedKeys` can be persisted via `initialState`, following the existing Pacer pattern (similar to RateLimiter):

```typescript
const savedState = localStorage.getItem('batcher-state')
const batcher = new Batcher(fn, {
  deduplicateItems: true,
  initialState: savedState ? JSON.parse(savedState) : {},
})
```

Fully opt-in with no breaking changes to existing behavior.
