---
id: injectDebouncedSignal
title: injectDebouncedSignal
---

## Call Signature

```ts
function injectDebouncedSignal<TValue, TSelected>(
   value,
   initialOptions,
selector): DebouncedSignal<TValue, TSelected>;
```

Defined in: [debouncer/injectDebouncedSignal.ts:62](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L62)

An Angular function that creates a debounced state signal, combining Angular's signal with debouncing functionality.
This function provides both the current debounced value and methods to update it.

The state value is only updated after the specified wait time has elapsed since the last update attempt.
If another update is attempted before the wait time expires, the timer resets and starts waiting again.
This is useful for handling frequent state updates that should be throttled, like search input values
or window resize dimensions.

The function returns a callable object:
- `debounced()`: Get the current debounced value
- `debounced.set(...)`: Set or update the debounced value (debounced via maybeExecute)
- `debounced.debouncer`: The debouncer instance with additional control methods and state signals

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying debouncer instance.
The `selector` parameter allows you to specify which debouncer state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

Available debouncer state properties:
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
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

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`DebouncerOptions`\<`Setter`\<`NoInfer`\<`TValue`\>\>\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`DebouncedSignal`](../type-aliases/DebouncedSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
const debouncedQuery = injectDebouncedSignal('', { wait: 500 })

// Get value
console.log(debouncedQuery())

// Set/update value (debounced)
debouncedQuery.set('hello')

// Access debouncer
console.log(debouncedQuery.debouncer.state().isPending)
```

## Call Signature

```ts
function injectDebouncedSignal<TValue>(
   value,
   initialOptions,
   selector?): DebouncedSignal<TValue, {
}>;
```

Defined in: [debouncer/injectDebouncedSignal.ts:69](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L69)

An Angular function that creates a debounced state signal, combining Angular's signal with debouncing functionality.
This function provides both the current debounced value and methods to update it.

The state value is only updated after the specified wait time has elapsed since the last update attempt.
If another update is attempted before the wait time expires, the timer resets and starts waiting again.
This is useful for handling frequent state updates that should be throttled, like search input values
or window resize dimensions.

The function returns a callable object:
- `debounced()`: Get the current debounced value
- `debounced.set(...)`: Set or update the debounced value (debounced via maybeExecute)
- `debounced.debouncer`: The debouncer instance with additional control methods and state signals

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying debouncer instance.
The `selector` parameter allows you to specify which debouncer state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

Available debouncer state properties:
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

### Type Parameters

#### TValue

`TValue`

### Parameters

#### value

`TValue`

#### initialOptions

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`DebouncerOptions`\<`Setter`\<`NoInfer`\<`TValue`\>\>\>\>

#### selector?

`undefined`

### Returns

[`DebouncedSignal`](../type-aliases/DebouncedSignal.md)\<`TValue`, \{
\}\>

### Example

```ts
const debouncedQuery = injectDebouncedSignal('', { wait: 500 })

// Get value
console.log(debouncedQuery())

// Set/update value (debounced)
debouncedQuery.set('hello')

// Access debouncer
console.log(debouncedQuery.debouncer.state().isPending)
```

## Call Signature

```ts
function injectDebouncedSignal<TValue, TSelected>(
   value,
   initialOptions,
   selector?): DebouncedSignal<TValue,
  | {
}
| TSelected>;
```

Defined in: [debouncer/injectDebouncedSignal.ts:76](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L76)

An Angular function that creates a debounced state signal, combining Angular's signal with debouncing functionality.
This function provides both the current debounced value and methods to update it.

The state value is only updated after the specified wait time has elapsed since the last update attempt.
If another update is attempted before the wait time expires, the timer resets and starts waiting again.
This is useful for handling frequent state updates that should be throttled, like search input values
or window resize dimensions.

The function returns a callable object:
- `debounced()`: Get the current debounced value
- `debounced.set(...)`: Set or update the debounced value (debounced via maybeExecute)
- `debounced.debouncer`: The debouncer instance with additional control methods and state signals

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying debouncer instance.
The `selector` parameter allows you to specify which debouncer state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

Available debouncer state properties:
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
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

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`DebouncerOptions`\<`Setter`\<`NoInfer`\<`TValue`\>\>\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`DebouncedSignal`](../type-aliases/DebouncedSignal.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>

### Example

```ts
const debouncedQuery = injectDebouncedSignal('', { wait: 500 })

// Get value
console.log(debouncedQuery())

// Set/update value (debounced)
debouncedQuery.set('hello')

// Access debouncer
console.log(debouncedQuery.debouncer.state().isPending)
```
