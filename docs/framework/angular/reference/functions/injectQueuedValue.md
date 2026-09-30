---
id: injectQueuedValue
title: injectQueuedValue
---

## Call Signature

```ts
function injectQueuedValue<TValue, TSelected>(
   value,
   options?,
selector?): QueuedValueSignal<TValue, TSelected>;
```

Defined in: [queuer/injectQueuedValue.ts:48](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L48)

An Angular function that creates a queued value that processes state changes in order with an optional delay.
This function uses injectQueuedSignal internally to manage a queue of state changes and apply them sequentially.

The queued value will process changes in the order they are received, with optional delays between
processing each change. This is useful for handling state updates that need to be processed
in a specific order, like animations or sequential UI updates.

The returned signal provides the most recently processed value. Before the queue processes
an item, it provides the explicit initial value or the source's initial value.
Source reads are deferred until the signal is read or Angular runs its effect, so required
inputs can be bound before their values are read.

Use `queued.addItem(...)` to add a value and `queued.queuer` to control the queue.
Pending items are available through `queued.queuer.state().items` with the default selector.

Pass an options object as the third argument to supply an object or function as the initial
value. When those options are undefined or a factory, pass a fourth selector argument
(undefined is allowed) to distinguish the initial-value form from options plus a selector.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### value

`Signal`\<`TValue`\>

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`QueuedValueSignal`](../type-aliases/QueuedValueSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
const initialValue = signal('initial')
const queued = injectQueuedValue(initialValue, {
  wait: 500,
  started: true,
})

// Add changes to the queue
queued.addItem('new value')
```

## Call Signature

```ts
function injectQueuedValue<TValue, TSelected>(
   value,
   initialValue,
   options?,
selector?): QueuedValueSignal<TValue, TSelected>;
```

Defined in: [queuer/injectQueuedValue.ts:59](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L59)

An Angular function that creates a queued value that processes state changes in order with an optional delay.
This function uses injectQueuedSignal internally to manage a queue of state changes and apply them sequentially.

The queued value will process changes in the order they are received, with optional delays between
processing each change. This is useful for handling state updates that need to be processed
in a specific order, like animations or sequential UI updates.

The returned signal provides the most recently processed value. Before the queue processes
an item, it provides the explicit initial value or the source's initial value.
Source reads are deferred until the signal is read or Angular runs its effect, so required
inputs can be bound before their values are read.

Use `queued.addItem(...)` to add a value and `queued.queuer` to control the queue.
Pending items are available through `queued.queuer.state().items` with the default selector.

Pass an options object as the third argument to supply an object or function as the initial
value. When those options are undefined or a factory, pass a fourth selector argument
(undefined is allowed) to distinguish the initial-value form from options plus a selector.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### value

`Signal`\<`TValue`\>

#### initialValue

`Extract`\<`TValue`, `PrimitiveInitialValue`\>

#### options?

[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`, `TSelected`\>

#### selector?

(`state`) => `TSelected`

### Returns

[`QueuedValueSignal`](../type-aliases/QueuedValueSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
const initialValue = signal('initial')
const queued = injectQueuedValue(initialValue, {
  wait: 500,
  started: true,
})

// Add changes to the queue
queued.addItem('new value')
```

## Call Signature

```ts
function injectQueuedValue<TValue, TSelected>(
   value,
   initialValue,
   options,
selector?): QueuedValueSignal<TValue, TSelected>;
```

Defined in: [queuer/injectQueuedValue.ts:71](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L71)

An Angular function that creates a queued value that processes state changes in order with an optional delay.
This function uses injectQueuedSignal internally to manage a queue of state changes and apply them sequentially.

The queued value will process changes in the order they are received, with optional delays between
processing each change. This is useful for handling state updates that need to be processed
in a specific order, like animations or sequential UI updates.

The returned signal provides the most recently processed value. Before the queue processes
an item, it provides the explicit initial value or the source's initial value.
Source reads are deferred until the signal is read or Angular runs its effect, so required
inputs can be bound before their values are read.

Use `queued.addItem(...)` to add a value and `queued.queuer` to control the queue.
Pending items are available through `queued.queuer.state().items` with the default selector.

Pass an options object as the third argument to supply an object or function as the initial
value. When those options are undefined or a factory, pass a fourth selector argument
(undefined is allowed) to distinguish the initial-value form from options plus a selector.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### value

`Signal`\<`TValue`\>

#### initialValue

`TValue`

#### options

[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`, `TSelected`\>

#### selector?

(`state`) => `TSelected`

### Returns

[`QueuedValueSignal`](../type-aliases/QueuedValueSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
const initialValue = signal('initial')
const queued = injectQueuedValue(initialValue, {
  wait: 500,
  started: true,
})

// Add changes to the queue
queued.addItem('new value')
```

## Call Signature

```ts
function injectQueuedValue<TValue, TSelected>(
   value,
   initialValue,
   options,
selector): QueuedValueSignal<TValue, TSelected>;
```

Defined in: [queuer/injectQueuedValue.ts:83](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L83)

An Angular function that creates a queued value that processes state changes in order with an optional delay.
This function uses injectQueuedSignal internally to manage a queue of state changes and apply them sequentially.

The queued value will process changes in the order they are received, with optional delays between
processing each change. This is useful for handling state updates that need to be processed
in a specific order, like animations or sequential UI updates.

The returned signal provides the most recently processed value. Before the queue processes
an item, it provides the explicit initial value or the source's initial value.
Source reads are deferred until the signal is read or Angular runs its effect, so required
inputs can be bound before their values are read.

Use `queued.addItem(...)` to add a value and `queued.queuer` to control the queue.
Pending items are available through `queued.queuer.state().items` with the default selector.

Pass an options object as the third argument to supply an object or function as the initial
value. When those options are undefined or a factory, pass a fourth selector argument
(undefined is allowed) to distinguish the initial-value form from options plus a selector.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### value

`Signal`\<`TValue`\>

#### initialValue

`TValue`

#### options

  \| [`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`, `TSelected`\>\>
  \| `undefined`

#### selector

((`state`) => `TSelected`) \| `undefined`

### Returns

[`QueuedValueSignal`](../type-aliases/QueuedValueSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
const initialValue = signal('initial')
const queued = injectQueuedValue(initialValue, {
  wait: 500,
  started: true,
})

// Add changes to the queue
queued.addItem('new value')
```
