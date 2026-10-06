---
id: injectQueuer
title: injectQueuer
---

## Call Signature

```ts
function injectQueuer<TValue, TSelected>(
   fn,
   options,
selector): AngularQueuer<TValue, TSelected>;
```

Defined in: [queuer/injectQueuer.ts:109](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L109)

An Angular function that creates and manages a Queuer instance.

This is a lower-level function that provides direct access to the Queuer's functionality.
This allows you to integrate it with any state management solution you prefer.

The Queuer processes items synchronously in order, with optional delays between processing each item.
The queuer includes an internal tick mechanism that can be started and stopped, making it useful as a scheduler.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### fn

(`item`) => `void`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`AngularQueuer`](../interfaces/AngularQueuer.md)\<`TValue`, `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const queue = injectQueuer(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 }
);

// Opt-in to track queue contents changes
const queue = injectQueuer(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 },
  (state) => ({ items: state.items, size: state.size })
);

// Add items
queue.addItem('task1');

// Access the selected state
const { items, isRunning } = queue.state();
```

## Cleanup on Destroy

By default, the function stops the queuer when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending items instead:

```ts
const queue = injectQueuer(fn, {
  started: true,
  onUnmount: (q) => q.flush()
});
```

## Call Signature

```ts
function injectQueuer<TValue>(
   fn,
   options?,
   selector?): AngularQueuer<TValue, {
}>;
```

Defined in: [queuer/injectQueuer.ts:114](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L114)

An Angular function that creates and manages a Queuer instance.

This is a lower-level function that provides direct access to the Queuer's functionality.
This allows you to integrate it with any state management solution you prefer.

The Queuer processes items synchronously in order, with optional delays between processing each item.
The queuer includes an internal tick mechanism that can be started and stopped, making it useful as a scheduler.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### fn

(`item`) => `void`

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`, \{
\}\>\>

#### selector?

`undefined`

### Returns

[`AngularQueuer`](../interfaces/AngularQueuer.md)\<`TValue`, \{
\}\>

### Example

```ts
// Default selected state is an empty object
const queue = injectQueuer(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 }
);

// Opt-in to track queue contents changes
const queue = injectQueuer(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 },
  (state) => ({ items: state.items, size: state.size })
);

// Add items
queue.addItem('task1');

// Access the selected state
const { items, isRunning } = queue.state();
```

## Cleanup on Destroy

By default, the function stops the queuer when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending items instead:

```ts
const queue = injectQueuer(fn, {
  started: true,
  onUnmount: (q) => q.flush()
});
```

## Call Signature

```ts
function injectQueuer<TValue, TSelected>(
   fn,
   options?,
   selector?): AngularQueuer<TValue,
  | {
}
| TSelected>;
```

Defined in: [queuer/injectQueuer.ts:119](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L119)

An Angular function that creates and manages a Queuer instance.

This is a lower-level function that provides direct access to the Queuer's functionality.
This allows you to integrate it with any state management solution you prefer.

The Queuer processes items synchronously in order, with optional delays between processing each item.
The queuer includes an internal tick mechanism that can be started and stopped, making it useful as a scheduler.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### fn

(`item`) => `void`

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`AngularQueuer`](../interfaces/AngularQueuer.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const queue = injectQueuer(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 }
);

// Opt-in to track queue contents changes
const queue = injectQueuer(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 },
  (state) => ({ items: state.items, size: state.size })
);

// Add items
queue.addItem('task1');

// Access the selected state
const { items, isRunning } = queue.state();
```

## Cleanup on Destroy

By default, the function stops the queuer when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending items instead:

```ts
const queue = injectQueuer(fn, {
  started: true,
  onUnmount: (q) => q.flush()
});
```
