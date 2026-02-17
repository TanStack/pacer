---
id: AsyncBatcherOptions
title: AsyncBatcherOptions
---

# Interface: AsyncBatcherOptions\<TValue\>

Defined in: [async-batcher.ts:89](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L89)

Options for configuring an AsyncBatcher instance

## Type Parameters

### TValue

`TValue`

## Properties

### asyncRetryerOptions?

```ts
optional asyncRetryerOptions: AsyncRetryerOptions<(items) => Promise<any>>;
```

Defined in: [async-batcher.ts:93](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L93)

Options for configuring the underlying async retryer

***

### getShouldExecute()?

```ts
optional getShouldExecute: (items, batcher) => boolean;
```

Defined in: [async-batcher.ts:100](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L100)

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
optional initialState: Partial<AsyncBatcherState<TValue>>;
```

Defined in: [async-batcher.ts:107](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L107)

Initial state for the async batcher

***

### key?

```ts
optional key: string;
```

Defined in: [async-batcher.ts:112](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L112)

Optional key to identify this async batcher instance.
If provided, the async batcher will be identified by this key in the devtools and PacerProvider if applicable.

***

### maxSize?

```ts
optional maxSize: number;
```

Defined in: [async-batcher.ts:117](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L117)

Maximum number of items in a batch

#### Default

```ts
Infinity
```

***

### onError()?

```ts
optional onError: (error, batch, batcher) => void;
```

Defined in: [async-batcher.ts:123](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L123)

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

### onItemsChange()?

```ts
optional onItemsChange: (batcher) => void;
```

Defined in: [async-batcher.ts:131](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L131)

Callback fired after items are added to the batcher

#### Parameters

##### batcher

[`AsyncBatcher`](../classes/AsyncBatcher.md)\<`TValue`\>

#### Returns

`void`

***

### onSettled()?

```ts
optional onSettled: (batch, batcher) => void;
```

Defined in: [async-batcher.ts:135](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L135)

Optional callback to call when a batch is settled (completed or failed)

#### Parameters

##### batch

`TValue`[]

##### batcher

[`AsyncBatcher`](../classes/AsyncBatcher.md)\<`TValue`\>

#### Returns

`void`

***

### onSuccess()?

```ts
optional onSuccess: (result, batch, batcher) => void;
```

Defined in: [async-batcher.ts:139](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L139)

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

### onUnmount()?

```ts
optional onUnmount: (batcher) => void;
```

Defined in: [async-batcher.ts:160](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L160)

Optional callback invoked when the component unmounts. Receives the batcher instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.
Framework adapters only; ignored by core.

#### Parameters

##### batcher

[`AsyncBatcher`](../classes/AsyncBatcher.md)\<`TValue`\>

#### Returns

`void`

***

### started?

```ts
optional started: boolean;
```

Defined in: [async-batcher.ts:148](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L148)

Whether the batcher should start processing immediately

#### Default

```ts
true
```

***

### throwOnError?

```ts
optional throwOnError: boolean;
```

Defined in: [async-batcher.ts:154](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L154)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### wait?

```ts
optional wait: number | (asyncBatcher) => number;
```

Defined in: [async-batcher.ts:167](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L167)

Maximum time in milliseconds to wait before processing a batch.
If the wait duration has elapsed, the batch will be processed.
If not provided, the batch will not be triggered by a timeout.

#### Default

```ts
Infinity
```
