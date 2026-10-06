---
id: injectThrottledSignal
title: injectThrottledSignal
---

## Call Signature

```ts
function injectThrottledSignal<TValue, TSelected>(
   value,
   initialOptions,
selector): ThrottledSignal<TValue, TSelected>;
```

Defined in: [throttler/injectThrottledSignal.ts:62](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L62)

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

`TValue`

#### initialOptions

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`ThrottlerOptions`\<`Setter`\<`NoInfer`\<`TValue`\>\>\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`ThrottledSignal`](../type-aliases/ThrottledSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
const throttledScrollY = injectThrottledSignal(0, { wait: 100 })

// Get value
console.log(throttledScrollY())

// Set/update value (throttled)
throttledScrollY.set(window.scrollY)

// Access throttler
console.log(throttledScrollY.throttler.state().isPending)
```

## Call Signature

```ts
function injectThrottledSignal<TValue>(
   value,
   initialOptions,
   selector?): ThrottledSignal<TValue, {
}>;
```

Defined in: [throttler/injectThrottledSignal.ts:69](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L69)

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

`TValue`

#### initialOptions

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`ThrottlerOptions`\<`Setter`\<`NoInfer`\<`TValue`\>\>\>\>

#### selector?

`undefined`

### Returns

[`ThrottledSignal`](../type-aliases/ThrottledSignal.md)\<`TValue`, \{
\}\>

### Example

```ts
const throttledScrollY = injectThrottledSignal(0, { wait: 100 })

// Get value
console.log(throttledScrollY())

// Set/update value (throttled)
throttledScrollY.set(window.scrollY)

// Access throttler
console.log(throttledScrollY.throttler.state().isPending)
```

## Call Signature

```ts
function injectThrottledSignal<TValue, TSelected>(
   value,
   initialOptions,
   selector?): ThrottledSignal<TValue,
  | {
}
| TSelected>;
```

Defined in: [throttler/injectThrottledSignal.ts:76](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L76)

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

`TValue`

#### initialOptions

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`ThrottlerOptions`\<`Setter`\<`NoInfer`\<`TValue`\>\>\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`ThrottledSignal`](../type-aliases/ThrottledSignal.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>

### Example

```ts
const throttledScrollY = injectThrottledSignal(0, { wait: 100 })

// Get value
console.log(throttledScrollY())

// Set/update value (throttled)
throttledScrollY.set(window.scrollY)

// Access throttler
console.log(throttledScrollY.throttler.state().isPending)
```
