---
id: createAsyncThrottler
title: createAsyncThrottler
---

```ts
function createAsyncThrottler<TFn, TSelected>(
   fn,
   options,
selector?): SvelteAsyncThrottler<TFn, TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts:93](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts#L93)

Creates and retains the AsyncThrottler for its Svelte owner.

Limits execution to at most one call per wait interval. Leading and trailing options control immediate and deferred execution; the trailing call uses the latest arguments.

The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
Use onSuccess, onError, and onSettled for execution outcomes.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Read selected state through utility.state. Use utility.Subscribe with a children snippet
to select state in a child without updating the owner.

Available state fields:

- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the throttled function is currently executing asynchronously
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last function execution in milliseconds
- `lastResult`: The result from the most recent successful function execution
- `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
- `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed
- `successCount`: Number of function executions that have completed successfully

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
Destroying the component calls cancel() and abort().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

Function executed by the utility.

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteAsyncThrottlerOptions`](../interfaces/SvelteAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`SvelteAsyncThrottler`](../interfaces/SvelteAsyncThrottler.md)\<`TFn`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { createAsyncThrottler } from '@tanstack/svelte-pacer'

const utility = createAsyncThrottler(
  async (value: string) => { console.log(value) },
  { wait: 500 },
  (state) => ({ isPending: state.isPending }),
)
utility.maybeExecute('item')
// Selected state: utility.state.isPending
```
