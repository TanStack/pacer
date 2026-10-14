---
id: injectAsyncQueuerItems
title: injectAsyncQueuerItems
---

## Call Signature

```ts
function injectAsyncQueuerItems<TValue>(fn, options?): AngularAsyncQueuerItems<TValue>;
```

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuerItems.ts:51](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuerItems.ts#L51)

Creates a readonly Angular signal of pending asynchronous queue items.

Items appear when added and disappear when removed for processing. This signal
contains waiting items, not processing results. Use the attached `queuer` methods
to add items, start or stop processing, or inspect the queue.

Options accept a static object or reactive factory and follow the underlying
queuer's lifecycle and provider behavior. The returned function is an Angular signal.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### fn

(`value`) => `Promise`\<`any`\>

The callback that processes each queued item.

#### options?

`MaybeAccessor`\<[`AngularAsyncQueuerOptions`](../interfaces/AngularAsyncQueuerOptions.md)\<`TValue`\>\>

Core queue options or a reactive options factory.

### Returns

[`AngularAsyncQueuerItems`](../interfaces/AngularAsyncQueuerItems.md)\<`TValue`\>

A readonly items signal with `queuer` and `addItem` attributes.

### Example

```ts
// In a component or service injection context.
const items = injectAsyncQueuerItems(
  async (item: string) => console.log(item),
  { started: false },
)
items.addItem('job')
console.log(items()) // ['job']
items.queuer.start()
```

## Call Signature

```ts
function injectAsyncQueuerItems<TValue, TSelected>(
   fn,
   options,
selector): AngularAsyncQueuerItems<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuerItems.ts:59](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuerItems.ts#L59)

Creates the items signal with selected state on its attached queuer.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### fn

(`value`) => `Promise`\<`any`\>

#### options

`MaybeAccessor`\<[`AngularAsyncQueuerOptions`](../interfaces/AngularAsyncQueuerOptions.md)\<`TValue`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached queuer.

### Returns

[`AngularAsyncQueuerItems`](../interfaces/AngularAsyncQueuerItems.md)\<`TValue`, `TSelected`\>
