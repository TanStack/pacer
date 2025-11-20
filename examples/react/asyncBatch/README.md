# AsyncBatch Example

This example demonstrates how to use the `asyncBatch` function from `@tanstack/react-pacer` wrapped in a `useCallback` hook for optimal performance.

The example combines features from both the `batch` and `useAsyncBatcher` examples:

- Uses `asyncBatch` function (functional API) like in the sync batcher examples
- Wrapped in `useCallback` for performance optimization
- Demonstrates async processing with error handling
- Shows manual state management for batch tracking

## Key Features

- **Async Processing**: Processes items asynchronously with simulated delays
- **Batch Control**: Batches up to 5 items or processes after 3 seconds
- **Urgent Processing**: Items marked as "urgent" trigger immediate processing
- **Error Handling**: Graceful error handling with configurable failure simulation
- **Performance**: Uses `useCallback` to prevent unnecessary re-renders
- **Manual State Management**: Tracks processing state without reactive hooks

## To run this example:

- `npm install`
- `npm run dev`
