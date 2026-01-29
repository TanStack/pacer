# useBatcher In-Batch Deduplication Example

This example demonstrates the in-batch deduplication feature of `useBatcher`.

## Key Features

- **In-batch deduplication**: Duplicate items within the same batch are automatically ignored or replaced based on the `deduplicateStrategy`
- **Visual testing**: Interactive UI to test deduplication behavior
- **Activity log**: See exactly what items are added vs. ignored

## Running the Example

```bash
pnpm dev
```

Then open http://localhost:3006

## How It Works

When `deduplicateItems: true` is set:
- Items are deduplicated within the current batch only
- The `deduplicateStrategy` determines whether to keep the first or last occurrence
- Duplicates are identified using the `getItemKey` function (or JSON.stringify for objects)

This is useful for scenarios like:
- Preventing duplicate API requests within the same batch
- Ensuring unique items in a batch operation
- Reducing redundant processing of the same data
