---
id: injectThrottledSignal
title: injectThrottledSignal
---

# Function: injectThrottledSignal()

```ts
function injectThrottledSignal<TValue, TSelected>(
   value, 
   initialOptions, 
selector?): ThrottledSignal<TValue, TSelected>;
```

Defined in: [angular-pacer/src/throttler/injectThrottledSignal.ts:64](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L64)

An Angular function that creates a throttled state signal, combining Angular's signal with throttling functionality.
This function provides both the current throttled value and methods to update it.

The state value is updated at most once within the specified wait time.
This is useful for handling frequent state updates that should be rate-limited, like scroll positions
or mouse movements.

The function returns a callable object:
- `throttled()`: Get the current throttled value
- `throttled.set(...)`: Set or update the throttled value (throttled via maybeExecute)
- `throttled.throttler`: The throttler instance with additional control methods and state signals

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying throttler instance.
The `selector` parameter allows you to specify which throttler state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

Available throttler state properties:
- `canLeadingExecute`: Whether the throttler can execute on the leading edge
- `canTrailingExecute`: Whether the throttler can execute on the trailing edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last execution
- `nextExecutionTime`: Timestamp of the next allowed execution
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### value

`TValue`

### initialOptions

`ThrottlerOptions`\<`Setter`\<`TValue`\>\>

### selector?

(`state`) => `TSelected`

## Returns

[`ThrottledSignal`](../interfaces/ThrottledSignal.md)\<`TValue`, `TSelected`\>

## Example

```ts
const throttledScrollY = injectThrottledSignal(0, { wait: 100 })

// Get value
console.log(throttledScrollY())

// Set/update value (throttled)
throttledScrollY.set(window.scrollY)

// Access throttler
console.log(throttledScrollY.throttler.state().isPending)
```
