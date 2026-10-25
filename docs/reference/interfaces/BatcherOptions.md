---
id: BatcherOptions
title: BatcherOptions
---

Defined in: [batcher.ts:52](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L52)

Options for configuring a Batcher instance

## Type Parameters

### TValue

`TValue`

## Properties

### getShouldExecute?

```ts
optional getShouldExecute?: (items, batcher) => boolean;
```

Defined in: [batcher.ts:57](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L57)

Custom function to determine if a batch should be processed
Return true to process the batch immediately

#### Parameters

##### items

`TValue`[]

##### batcher

[`Batcher`](../classes/Batcher.md)\<`TValue`\>

#### Returns

`boolean`

***

### initialState?

```ts
optional initialState?: Partial<BatcherState<TValue>>;
```

Defined in: [batcher.ts:61](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L61)

Initial state for the batcher

***

### key?

```ts
optional key?: string;
```

Defined in: [batcher.ts:66](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L66)

Optional key to identify this batcher instance.
If provided, the batcher will be identified by this key in the devtools and PacerProvider if applicable.

***

### maxSize?

```ts
optional maxSize?: number;
```

Defined in: [batcher.ts:71](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L71)

Maximum number of items in a batch

#### Default

```ts
Infinity
```

***

### onExecute?

```ts
optional onExecute?: (batch, batcher) => void;
```

Defined in: [batcher.ts:75](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L75)

Callback fired after a batch is processed

#### Parameters

##### batch

`TValue`[]

##### batcher

[`Batcher`](../classes/Batcher.md)\<`TValue`\>

#### Returns

`void`

***

### onItemsChange?

```ts
optional onItemsChange?: (batcher) => void;
```

Defined in: [batcher.ts:79](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L79)

Callback fired after items are added to the batcher

#### Parameters

##### batcher

[`Batcher`](../classes/Batcher.md)\<`TValue`\>

#### Returns

`void`

***

### started?

```ts
optional started?: boolean;
```

Defined in: [batcher.ts:84](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L84)

Whether the batcher should start processing immediately

#### Default

```ts
true
```

***

### wait?

```ts
optional wait?: number | ((batcher) => number);
```

Defined in: [batcher.ts:91](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L91)

Time in milliseconds to wait after the most recently added item before processing a batch.
Each `addItem` call restarts the timer, so the batch is processed once no new item has been added for this long.
If not provided, the batch will not be triggered by a timeout.

#### Default

```ts
Infinity
```
