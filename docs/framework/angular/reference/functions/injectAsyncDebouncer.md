---
id: injectAsyncDebouncer
title: injectAsyncDebouncer
---

## Call Signature

```ts
function injectAsyncDebouncer<TFn, TSelected>(
   fn,
   options,
selector): AngularAsyncDebouncer<TFn, TSelected>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:132](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L132)

An Angular function that creates and manages an AsyncDebouncer instance.

This is a lower-level function that provides direct access to the AsyncDebouncer's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides async debouncing functionality with promise support, error handling,
retry capabilities, and abort support.

The debouncer will only execute the function after the specified wait time has elapsed
since the last call. If the function is called again before the wait time expires, the
timer resets and starts waiting again.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

Available state properties:
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the debounced function is currently executing asynchronously
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastResult`: The result from the most recent successful function execution
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
- `successCount`: Number of function executions that have completed successfully

## Cleanup on Destroy

By default, the function cancels any pending execution and aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const debouncer = injectAsyncDebouncer(fn, {
  wait: 500,
  onUnmount: (d) => d.flush()
});
```

When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

#### TSelected

`TSelected`

### Parameters

#### fn

`TFn`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularAsyncDebouncerOptions`](../interfaces/AngularAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`AngularAsyncDebouncer`](../interfaces/AngularAsyncDebouncer.md)\<`TFn`, `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const debouncer = injectAsyncDebouncer(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  { wait: 500 }
);

// Opt-in to track isExecuting changes (optimized for loading states)
const debouncer = injectAsyncDebouncer(
  async (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ isExecuting: state.isExecuting, isPending: state.isPending })
);

// In an event handler
const handleChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const result = await debouncer.maybeExecute(target.value);
  console.log('Search results:', result);
};

// Access the selected state
const { isExecuting, errorCount } = debouncer.state();
```

## Call Signature

```ts
function injectAsyncDebouncer<TFn>(
   fn,
   options,
   selector?): AngularAsyncDebouncer<TFn, {
}>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:137](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L137)

An Angular function that creates and manages an AsyncDebouncer instance.

This is a lower-level function that provides direct access to the AsyncDebouncer's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides async debouncing functionality with promise support, error handling,
retry capabilities, and abort support.

The debouncer will only execute the function after the specified wait time has elapsed
since the last call. If the function is called again before the wait time expires, the
timer resets and starts waiting again.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

Available state properties:
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the debounced function is currently executing asynchronously
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastResult`: The result from the most recent successful function execution
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
- `successCount`: Number of function executions that have completed successfully

## Cleanup on Destroy

By default, the function cancels any pending execution and aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const debouncer = injectAsyncDebouncer(fn, {
  wait: 500,
  onUnmount: (d) => d.flush()
});
```

When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

### Parameters

#### fn

`TFn`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularAsyncDebouncerOptions`](../interfaces/AngularAsyncDebouncerOptions.md)\<`TFn`, \{
\}\>\>

#### selector?

`undefined`

### Returns

[`AngularAsyncDebouncer`](../interfaces/AngularAsyncDebouncer.md)\<`TFn`, \{
\}\>

### Example

```ts
// Default selected state is an empty object
const debouncer = injectAsyncDebouncer(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  { wait: 500 }
);

// Opt-in to track isExecuting changes (optimized for loading states)
const debouncer = injectAsyncDebouncer(
  async (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ isExecuting: state.isExecuting, isPending: state.isPending })
);

// In an event handler
const handleChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const result = await debouncer.maybeExecute(target.value);
  console.log('Search results:', result);
};

// Access the selected state
const { isExecuting, errorCount } = debouncer.state();
```

## Call Signature

```ts
function injectAsyncDebouncer<TFn, TSelected>(
   fn,
   options,
   selector?): AngularAsyncDebouncer<TFn,
  | {
}
| TSelected>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:142](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L142)

An Angular function that creates and manages an AsyncDebouncer instance.

This is a lower-level function that provides direct access to the AsyncDebouncer's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides async debouncing functionality with promise support, error handling,
retry capabilities, and abort support.

The debouncer will only execute the function after the specified wait time has elapsed
since the last call. If the function is called again before the wait time expires, the
timer resets and starts waiting again.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

Available state properties:
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the debounced function is currently executing asynchronously
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastResult`: The result from the most recent successful function execution
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
- `successCount`: Number of function executions that have completed successfully

## Cleanup on Destroy

By default, the function cancels any pending execution and aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const debouncer = injectAsyncDebouncer(fn, {
  wait: 500,
  onUnmount: (d) => d.flush()
});
```

When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### fn

`TFn`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularAsyncDebouncerOptions`](../interfaces/AngularAsyncDebouncerOptions.md)\<`TFn`,
  \| \{
\}
  \| `TSelected`\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`AngularAsyncDebouncer`](../interfaces/AngularAsyncDebouncer.md)\<`TFn`,
  \| \{
\}
  \| `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const debouncer = injectAsyncDebouncer(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  { wait: 500 }
);

// Opt-in to track isExecuting changes (optimized for loading states)
const debouncer = injectAsyncDebouncer(
  async (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ isExecuting: state.isExecuting, isPending: state.isPending })
);

// In an event handler
const handleChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const result = await debouncer.maybeExecute(target.value);
  console.log('Search results:', result);
};

// Access the selected state
const { isExecuting, errorCount } = debouncer.state();
```
