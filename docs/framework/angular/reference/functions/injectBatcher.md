---
id: injectBatcher
title: injectBatcher
---

## Call Signature

```ts
function injectBatcher<TValue, TSelected>(
   fn,
   options,
selector): AngularBatcher<TValue, TSelected>;
```

Defined in: [batcher/injectBatcher.ts:94](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L94)

An Angular function that creates and manages a Batcher instance.

This is a lower-level function that provides direct access to the Batcher's functionality.
This allows you to integrate it with any state management solution you prefer.

The Batcher collects items and processes them in batches based on configurable conditions:
- Maximum batch size
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

## Cleanup on Destroy

By default, the function cancels any pending batch when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const batcher = injectBatcher(fn, {
  maxSize: 5,
  onUnmount: (b) => b.flush()
});
```

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### fn

(`items`) => `void`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularBatcherOptions`](../interfaces/AngularBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`AngularBatcher`](../interfaces/AngularBatcher.md)\<`TValue`, `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const batcher = injectBatcher(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 }
);

// Add items
batcher.addItem('task1');

// Access the selected state
const { items, isPending } = batcher.state();
```

## Call Signature

```ts
function injectBatcher<TValue>(
   fn,
   options?,
   selector?): AngularBatcher<TValue, {
}>;
```

Defined in: [batcher/injectBatcher.ts:99](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L99)

An Angular function that creates and manages a Batcher instance.

This is a lower-level function that provides direct access to the Batcher's functionality.
This allows you to integrate it with any state management solution you prefer.

The Batcher collects items and processes them in batches based on configurable conditions:
- Maximum batch size
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

## Cleanup on Destroy

By default, the function cancels any pending batch when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const batcher = injectBatcher(fn, {
  maxSize: 5,
  onUnmount: (b) => b.flush()
});
```

### Type Parameters

#### TValue

`TValue`

### Parameters

#### fn

(`items`) => `void`

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularBatcherOptions`](../interfaces/AngularBatcherOptions.md)\<`TValue`, \{
\}\>\>

#### selector?

`undefined`

### Returns

[`AngularBatcher`](../interfaces/AngularBatcher.md)\<`TValue`, \{
\}\>

### Example

```ts
// Default selected state is an empty object
const batcher = injectBatcher(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 }
);

// Add items
batcher.addItem('task1');

// Access the selected state
const { items, isPending } = batcher.state();
```

## Call Signature

```ts
function injectBatcher<TValue, TSelected>(
   fn,
   options?,
   selector?): AngularBatcher<TValue,
  | {
}
| TSelected>;
```

Defined in: [batcher/injectBatcher.ts:104](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L104)

An Angular function that creates and manages a Batcher instance.

This is a lower-level function that provides direct access to the Batcher's functionality.
This allows you to integrate it with any state management solution you prefer.

The Batcher collects items and processes them in batches based on configurable conditions:
- Maximum batch size
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

## Cleanup on Destroy

By default, the function cancels any pending batch when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const batcher = injectBatcher(fn, {
  maxSize: 5,
  onUnmount: (b) => b.flush()
});
```

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### fn

(`items`) => `void`

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularBatcherOptions`](../interfaces/AngularBatcherOptions.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`AngularBatcher`](../interfaces/AngularBatcher.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const batcher = injectBatcher(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 }
);

// Add items
batcher.addItem('task1');

// Access the selected state
const { items, isPending } = batcher.state();
```
