---
id: createThrottledSignal
title: createThrottledSignal
---

# Function: createThrottledSignal()

```ts
function createThrottledSignal<TValue, TSelected>(
   value, 
   initialOptions, 
   selector?): [Accessor<TValue>, Setter<TValue>, SolidThrottler<Setter<TValue>, TSelected>];
```

Defined in: [solid-pacer/src/throttler/createThrottledSignal.ts:72](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottledSignal.ts#L72)

A Solid hook that creates a throttled state value that updates at most once within a specified time window.
This hook combines Solid's createSignal with throttling functionality to provide controlled state updates.

Throttling ensures state updates occur at a controlled rate regardless of how frequently the setter is called.
This is useful for rate-limiting expensive updates or operations that depend on rapidly changing state.

The hook returns a tuple containing:
- The throttled state value accessor
- A throttled setter function that respects the configured wait time
- The throttler instance for additional control

For more direct control over throttling without state management,
consider using the lower-level createThrottler hook instead.

## State Management and Selector

The hook uses TanStack Store for reactive state management via the underlying throttler instance.
The `selector` parameter allows you to specify which throttler state changes will trigger reactive updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary reactive updates and gives you
full control over when your component subscribes to state changes. Only when you provide a selector will
the reactive system track the selected state values.

Available throttler state properties:
- `canLeadingExecute`: Whether the throttler can execute on the leading edge
- `canTrailingExecute`: Whether the throttler can execute on the trailing edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger trailing execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Unix timestamp of the last execution
- `nextExecutionTime`: Unix timestamp of the next allowed execution
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

\[`Accessor`\<`TValue`\>, `Setter`\<`TValue`\>, [`SolidThrottler`](../interfaces/SolidThrottler.md)\<`Setter`\<`TValue`\>, `TSelected`\>\]

## Example

```tsx
// Default behavior - no reactive state subscriptions
const [value, setValue, throttler] = createThrottledSignal(0, { wait: 1000 });

// Opt-in to reactive updates when pending state changes (optimized for loading indicators)
const [value, setValue, throttler] = createThrottledSignal(
  0,
  { wait: 1000 },
  (state) => ({ isPending: state.isPending })
);

// With custom leading/trailing behavior
const [value, setValue] = createThrottledSignal(0, {
  wait: 1000,
  leading: true,   // Update immediately on first change
  trailing: false  // Skip trailing edge updates
});

// Access throttler state via signals
console.log('Executions:', throttler.state().executionCount);
console.log('Is pending:', throttler.state().isPending);
console.log('Last execution:', throttler.state().lastExecutionTime);
console.log('Next execution:', throttler.state().nextExecutionTime);
```
