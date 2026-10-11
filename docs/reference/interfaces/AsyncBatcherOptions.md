---
id: AsyncBatcherOptions
title: AsyncBatcherOptions
---

Defined in: [async-batcher.ts:90](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L90)

Options for configuring an AsyncBatcher instance

## Type Parameters

### TValue

`TValue`

## Properties

### asyncRetryerOptions?

```ts
optional asyncRetryerOptions?: AsyncRetryerOptions<(items) => Promise<any>>;
```

Defined in: [async-batcher.ts:94](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L94)

Options for configuring the underlying async retryer

***

### getShouldExecute?

```ts
optional getShouldExecute?: (items, batcher) => boolean;
```

Defined in: [async-batcher.ts:101](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L101)

Custom function to determine if a batch should be processed
Return true to process the batch immediately

#### Parameters

##### items

`TValue`[]

##### batcher

[`AsyncBatcher`](../classes/AsyncBatcher.md)\<`TValue`\>

#### Returns

`boolean`

***

### initialState?

```ts
optional initialState?: Partial<AsyncBatcherState<TValue>>;
```

Defined in: [async-batcher.ts:108](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L108)

Initial state for the async batcher

***

### key?

```ts
optional key?: string;
```

Defined in: [async-batcher.ts:113](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L113)

Optional key to identify this async batcher instance.
If provided, the async batcher will be identified by this key in the devtools and PacerProvider if applicable.

***

### maxSize?

```ts
optional maxSize?: number;
```

Defined in: [async-batcher.ts:118](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L118)

Maximum number of items in a batch

#### Default

```ts
Infinity
```

***

### onError?

```ts
optional onError?: (error, batch, batcher) => void;
```

Defined in: [async-batcher.ts:124](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L124)

Optional error handler for when the batch function throws.
If provided, the handler will be called with the error, the batch of items that failed, and batcher instance.
This can be used alongside throwOnError - the handler will be called before any error is thrown.

#### Parameters

##### error

`Error`

##### batch

`TValue`[]

##### batcher

[`AsyncBatcher`](../classes/AsyncBatcher.md)\<`TValue`\>

#### Returns

`void`

***

### onItemsChange?

```ts
optional onItemsChange?: (batcher) => void;
```

Defined in: [async-batcher.ts:132](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L132)

Callback fired after items are added to the batcher

#### Parameters

##### batcher

[`AsyncBatcher`](../classes/AsyncBatcher.md)\<`TValue`\>

#### Returns

`void`

***

### onSettled?

```ts
optional onSettled?: (batch, batcher) => void;
```

Defined in: [async-batcher.ts:136](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L136)

Optional callback to call when a batch is settled (completed or failed)

#### Parameters

##### batch

`TValue`[]

##### batcher

[`AsyncBatcher`](../classes/AsyncBatcher.md)\<`TValue`\>

#### Returns

`void`

***

### onSuccess?

```ts
optional onSuccess?: (result, batch, batcher) => void;
```

Defined in: [async-batcher.ts:140](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L140)

Optional callback to call when a batch succeeds

#### Parameters

##### result

`any`

##### batch

`TValue`[]

##### batcher

[`AsyncBatcher`](../classes/AsyncBatcher.md)\<`TValue`\>

#### Returns

`void`

***

### started?

```ts
optional started?: boolean;
```

Defined in: [async-batcher.ts:149](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L149)

Whether the batcher should start processing immediately

#### Default

```ts
true
```

***

### throwOnError?

```ts
optional throwOnError?: boolean;
```

Defined in: [async-batcher.ts:155](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L155)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### wait?

```ts
optional wait?: number | ((asyncBatcher) => number);
```

Defined in: [async-batcher.ts:162](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L162)

Maximum time in milliseconds to wait before processing a batch.
If the wait duration has elapsed, the batch will be processed.
If not provided, the batch will not be triggered by a timeout.

#### Default

```ts
Infinity
```
