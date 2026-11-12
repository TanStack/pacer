---
id: injectQueuerItems
title: injectQueuerItems
---

## Call Signature

```ts
function injectQueuerItems<TValue>(fn, options?): AngularQueuerItems<TValue>;
```

Defined in: [packages/angular-pacer/src/queuer/injectQueuerItems.ts:48](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuerItems.ts#L48)

Creates a readonly Angular signal of pending queue items.

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

(`value`) => `void`

The callback that processes each queued item.

#### options?

`MaybeAccessor`\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`\>\>

Core queue options or a reactive options factory.

### Returns

[`AngularQueuerItems`](../interfaces/AngularQueuerItems.md)\<`TValue`\>

A readonly items signal with `queuer` and `addItem` attributes.

### Example

```ts
// In a component or service injection context.
const items = injectQueuerItems(
  (item: string) => console.log(item),
  { started: false },
)
items.addItem('job')
console.log(items()) // ['job']
items.queuer.start()
```

## Call Signature

```ts
function injectQueuerItems<TValue, TSelected>(
   fn,
   options,
selector): AngularQueuerItems<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/queuer/injectQueuerItems.ts:56](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuerItems.ts#L56)

Creates the items signal with selected state on its attached queuer.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### fn

(`value`) => `void`

#### options

`MaybeAccessor`\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached queuer.

### Returns

[`AngularQueuerItems`](../interfaces/AngularQueuerItems.md)\<`TValue`, `TSelected`\>
