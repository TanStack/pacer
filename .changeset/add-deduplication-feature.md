---
"@tanstack/pacer": minor
---

Add in-batch/in-queue deduplication support to Batcher and Queuer

This feature adds `deduplicateItems` option to prevent duplicate items within the same batch or queue.

### New Options

- `deduplicateItems: boolean` - Enable automatic deduplication within the current batch/queue (default: false)
- `deduplicateStrategy: 'keep-first' | 'keep-last'` - Strategy for handling duplicates (default: 'keep-first')
- `getItemKey: (item) => string | number` - Extract unique key from item (defaults to JSON.stringify for objects)

### Behavior

When `deduplicateItems` is enabled:
- **'keep-first'**: Ignores new items if an item with the same key already exists in the batch/queue
- **'keep-last'**: Replaces existing items with new items that have the same key

### Use Cases

Prevents redundant items within a single batch or queue cycle:
- API batching: Avoid duplicate IDs in the same batch request
- Event processing: Deduplicate events before processing

### Example

```typescript
const batcher = new Batcher<{ userId: string }>(
  (items) => fetchUsers(items.map(i => i.userId)),
  {
    deduplicateItems: true,
    getItemKey: (item) => item.userId,
  }
);

batcher.addItem({ userId: 'user-1' }); // Added to batch
batcher.addItem({ userId: 'user-2' }); // Added to batch
batcher.addItem({ userId: 'user-1' }); // Ignored! Already in current batch
batcher.flush(); // Processes [user-1, user-2]
```

Fully opt-in with no breaking changes to existing behavior.
