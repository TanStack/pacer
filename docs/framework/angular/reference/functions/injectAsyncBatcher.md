---
id: injectAsyncBatcher
title: injectAsyncBatcher
---

## Call Signature

```ts
function injectAsyncBatcher<TValue, TSelected>(
   fn,
   options,
selector): AngularAsyncBatcher<TValue, TSelected>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:114](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L114)

An Angular function that creates and manages an AsyncBatcher instance.

This is a lower-level function that provides direct access to the AsyncBatcher's functionality.
This allows you to integrate it with any state management solution you prefer.

The AsyncBatcher collects items and processes them in batches asynchronously with support for
promise-based processing, error handling, retry capabilities, and abort support.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

## Cleanup on Destroy

By default, the function cancels any pending batch and aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const batcher = injectAsyncBatcher(fn, {
  maxSize: 10,
  onUnmount: (b) => b.flush()
});
```

When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### fn

(`items`) => `Promise`\<`any`\>

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularAsyncBatcherOptions`](../interfaces/AngularAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`AngularAsyncBatcher`](../interfaces/AngularAsyncBatcher.md)\<`TValue`, `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const batcher = injectAsyncBatcher(
  async (items: Array<Data>) => {
    const response = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify(items)
    });
    return response.json();
  },
  { maxSize: 10, wait: 2000 }
);

// Add items
batcher.addItem(data1);
batcher.addItem(data2);

// Access the selected state
const { items, isExecuting } = batcher.state();
```

## Call Signature

```ts
function injectAsyncBatcher<TValue>(
   fn,
   options?,
   selector?): AngularAsyncBatcher<TValue, {
}>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:119](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L119)

An Angular function that creates and manages an AsyncBatcher instance.

This is a lower-level function that provides direct access to the AsyncBatcher's functionality.
This allows you to integrate it with any state management solution you prefer.

The AsyncBatcher collects items and processes them in batches asynchronously with support for
promise-based processing, error handling, retry capabilities, and abort support.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

## Cleanup on Destroy

By default, the function cancels any pending batch and aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const batcher = injectAsyncBatcher(fn, {
  maxSize: 10,
  onUnmount: (b) => b.flush()
});
```

When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### fn

(`items`) => `Promise`\<`any`\>

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularAsyncBatcherOptions`](../interfaces/AngularAsyncBatcherOptions.md)\<`TValue`, \{
\}\>\>

#### selector?

`undefined`

### Returns

[`AngularAsyncBatcher`](../interfaces/AngularAsyncBatcher.md)\<`TValue`, \{
\}\>

### Example

```ts
// Default selected state is an empty object
const batcher = injectAsyncBatcher(
  async (items: Array<Data>) => {
    const response = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify(items)
    });
    return response.json();
  },
  { maxSize: 10, wait: 2000 }
);

// Add items
batcher.addItem(data1);
batcher.addItem(data2);

// Access the selected state
const { items, isExecuting } = batcher.state();
```

## Call Signature

```ts
function injectAsyncBatcher<TValue, TSelected>(
   fn,
   options?,
   selector?): AngularAsyncBatcher<TValue,
  | {
}
| TSelected>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:124](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L124)

An Angular function that creates and manages an AsyncBatcher instance.

This is a lower-level function that provides direct access to the AsyncBatcher's functionality.
This allows you to integrate it with any state management solution you prefer.

The AsyncBatcher collects items and processes them in batches asynchronously with support for
promise-based processing, error handling, retry capabilities, and abort support.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

## Cleanup on Destroy

By default, the function cancels any pending batch and aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const batcher = injectAsyncBatcher(fn, {
  maxSize: 10,
  onUnmount: (b) => b.flush()
});
```

When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### fn

(`items`) => `Promise`\<`any`\>

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularAsyncBatcherOptions`](../interfaces/AngularAsyncBatcherOptions.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`AngularAsyncBatcher`](../interfaces/AngularAsyncBatcher.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const batcher = injectAsyncBatcher(
  async (items: Array<Data>) => {
    const response = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify(items)
    });
    return response.json();
  },
  { maxSize: 10, wait: 2000 }
);

// Add items
batcher.addItem(data1);
batcher.addItem(data2);

// Access the selected state
const { items, isExecuting } = batcher.state();
```
