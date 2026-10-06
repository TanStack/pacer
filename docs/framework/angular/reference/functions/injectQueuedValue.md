---
id: injectQueuedValue
title: injectQueuedValue
---

## Call Signature

```ts
function injectQueuedValue<TValue, TSelected>(
   value,
   options,
selector): QueuedValueSignal<TValue, TSelected>;
```

Defined in: [queuer/injectQueuedValue.ts:19](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L19)

Queue source changes and expose the most recently processed value.
The source supplies the initial value lazily, after required inputs are bound.
Use addItem() to enqueue a value and queuer to control processing.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### value

() => `TValue`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`QueuedValueSignal`](../type-aliases/QueuedValueSignal.md)\<`TValue`, `TSelected`\>

## Call Signature

```ts
function injectQueuedValue<TValue>(
   value,
   options?,
selector?): QueuedValueSignal<TValue, Pick<QueuerState<TValue>, "items">>;
```

Defined in: [queuer/injectQueuedValue.ts:27](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L27)

Queue source changes and expose the most recently processed value.
The source supplies the initial value lazily, after required inputs are bound.
Use addItem() to enqueue a value and queuer to control processing.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### value

() => `TValue`

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`, `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>\>\>

#### selector?

`undefined`

### Returns

[`QueuedValueSignal`](../type-aliases/QueuedValueSignal.md)\<`TValue`, `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>\>

## Call Signature

```ts
function injectQueuedValue<TValue, TSelected>(
   value,
   options?,
selector?): QueuedValueSignal<TValue, TSelected | Pick<QueuerState<TValue>, "items">>;
```

Defined in: [queuer/injectQueuedValue.ts:34](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L34)

Queue source changes and expose the most recently processed value.
The source supplies the initial value lazily, after required inputs are bound.
Use addItem() to enqueue a value and queuer to control processing.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### value

() => `TValue`

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`, `TSelected` \| `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`QueuedValueSignal`](../type-aliases/QueuedValueSignal.md)\<`TValue`, `TSelected` \| `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>\>
