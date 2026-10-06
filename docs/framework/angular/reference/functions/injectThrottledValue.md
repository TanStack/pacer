---
id: injectThrottledValue
title: injectThrottledValue
---

## Call Signature

```ts
function injectThrottledValue<TValue, TSelected>(
   value,
   options,
selector): ThrottledSignal<TValue, TSelected>;
```

Defined in: [throttler/injectThrottledValue.ts:70](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledValue.ts#L70)

An Angular function that creates a throttled value that updates at most once within a specified time window.
Unlike injectThrottledSignal, this function automatically tracks changes to the input signal
and updates the throttled value accordingly.

The throttled value will update at most once within the specified wait time, regardless of
how frequently the input value changes.

This is useful for deriving throttled values from signals that change frequently,
like scroll positions or mouse coordinates, where you want to limit how often downstream effects
or calculations occur.

The function returns a throttled signal object containing:
- A Signal that provides the current throttled value
- The throttler instance with control methods

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying throttler instance.
The `selector` parameter allows you to specify which throttler state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

Available throttler state properties:
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last execution
- `nextExecutionTime`: Timestamp of the next allowed execution
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### value

() => `TValue`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<`Setter`\<`TValue`\>, `TSelected`\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`ThrottledSignal`](../type-aliases/ThrottledSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const scrollY = signal(0)
const throttledScrollY = injectThrottledValue(scrollY, {
  wait: 100, // Update at most once per 100ms
})

// Opt-in to reactive updates when pending state changes
const throttledScrollYWithState = injectThrottledValue(
  scrollY,
  { wait: 100 },
  (state) => ({ isPending: state.isPending }),
)

// Read the throttled signal value
effect(() => {
  updateUI(throttledScrollY())
})

// Access throttler state via the returned object's state() signal
console.log('Is pending:', throttledScrollYWithState.throttler.state().isPending)

// Control the throttler
throttledScrollY.throttler.cancel() // Cancel any pending updates
```

## Call Signature

```ts
function injectThrottledValue<TValue>(
   value,
   options,
   selector?): ThrottledSignal<TValue, {
}>;
```

Defined in: [throttler/injectThrottledValue.ts:77](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledValue.ts#L77)

An Angular function that creates a throttled value that updates at most once within a specified time window.
Unlike injectThrottledSignal, this function automatically tracks changes to the input signal
and updates the throttled value accordingly.

The throttled value will update at most once within the specified wait time, regardless of
how frequently the input value changes.

This is useful for deriving throttled values from signals that change frequently,
like scroll positions or mouse coordinates, where you want to limit how often downstream effects
or calculations occur.

The function returns a throttled signal object containing:
- A Signal that provides the current throttled value
- The throttler instance with control methods

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying throttler instance.
The `selector` parameter allows you to specify which throttler state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

Available throttler state properties:
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last execution
- `nextExecutionTime`: Timestamp of the next allowed execution
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

### Type Parameters

#### TValue

`TValue`

### Parameters

#### value

() => `TValue`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<`Setter`\<`TValue`\>, \{
\}\>\>

#### selector?

`undefined`

### Returns

[`ThrottledSignal`](../type-aliases/ThrottledSignal.md)\<`TValue`, \{
\}\>

### Example

```ts
// Default selected state is an empty object
const scrollY = signal(0)
const throttledScrollY = injectThrottledValue(scrollY, {
  wait: 100, // Update at most once per 100ms
})

// Opt-in to reactive updates when pending state changes
const throttledScrollYWithState = injectThrottledValue(
  scrollY,
  { wait: 100 },
  (state) => ({ isPending: state.isPending }),
)

// Read the throttled signal value
effect(() => {
  updateUI(throttledScrollY())
})

// Access throttler state via the returned object's state() signal
console.log('Is pending:', throttledScrollYWithState.throttler.state().isPending)

// Control the throttler
throttledScrollY.throttler.cancel() // Cancel any pending updates
```

## Call Signature

```ts
function injectThrottledValue<TValue, TSelected>(
   value,
   options,
   selector?): ThrottledSignal<TValue,
  | {
}
| TSelected>;
```

Defined in: [throttler/injectThrottledValue.ts:82](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledValue.ts#L82)

An Angular function that creates a throttled value that updates at most once within a specified time window.
Unlike injectThrottledSignal, this function automatically tracks changes to the input signal
and updates the throttled value accordingly.

The throttled value will update at most once within the specified wait time, regardless of
how frequently the input value changes.

This is useful for deriving throttled values from signals that change frequently,
like scroll positions or mouse coordinates, where you want to limit how often downstream effects
or calculations occur.

The function returns a throttled signal object containing:
- A Signal that provides the current throttled value
- The throttler instance with control methods

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying throttler instance.
The `selector` parameter allows you to specify which throttler state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

Available throttler state properties:
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last execution
- `nextExecutionTime`: Timestamp of the next allowed execution
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### value

() => `TValue`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<`Setter`\<`TValue`\>,
  \| \{
\}
  \| `TSelected`\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`ThrottledSignal`](../type-aliases/ThrottledSignal.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const scrollY = signal(0)
const throttledScrollY = injectThrottledValue(scrollY, {
  wait: 100, // Update at most once per 100ms
})

// Opt-in to reactive updates when pending state changes
const throttledScrollYWithState = injectThrottledValue(
  scrollY,
  { wait: 100 },
  (state) => ({ isPending: state.isPending }),
)

// Read the throttled signal value
effect(() => {
  updateUI(throttledScrollY())
})

// Access throttler state via the returned object's state() signal
console.log('Is pending:', throttledScrollYWithState.throttler.state().isPending)

// Control the throttler
throttledScrollY.throttler.cancel() // Cancel any pending updates
```
