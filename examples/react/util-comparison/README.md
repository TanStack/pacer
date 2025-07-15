# TanStack Pacer Utilities Comparison

This example demonstrates the differences between the five main TanStack Pacer utilities:

- **useDebouncer** - Delays execution until after a period of inactivity
- **useThrottler** - Limits execution to once per time period
- **useRateLimiter** - Allows a maximum number of executions per time window
- **useQueuer** - Processes items sequentially with optional delays
- **useBatcher** - Collects items and processes them in batches

## What This Example Shows

Move the range slider to see how each utility behaves differently:

1. **Debouncer** waits for 300ms of inactivity before executing
2. **Throttler** executes immediately then blocks for 300ms
3. **Rate Limiter** allows up to 10 executions per 1000ms window
4. **Queuer** processes items one by one with 100ms delays
5. **Batcher** collects items and processes them in groups of 5 or after 300ms

Each utility shows:

- A range slider with the processed value
- Execution count and reduction percentage
- Flush button to force immediate execution
- Detailed state information

## Key Differences

- **Debouncer**: Best for search inputs - waits for user to stop typing
- **Throttler**: Best for scroll/resize events - immediate response with controlled frequency
- **Rate Limiter**: Best for API calls - prevents overwhelming external services
- **Queuer**: Best for sequential operations - maintains order and prevents overlapping
- **Batcher**: Best for bulk operations - efficient processing of multiple items

## Running the Example

```bash
npm install
npm run dev
```
