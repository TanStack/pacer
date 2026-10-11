---
id: AsyncQueuerOptions
title: AsyncQueuerOptions
---

Defined in: [async-queuer.ts:113](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L113)

## Type Parameters

### TValue

`TValue`

## Properties

### addItemsTo?

```ts
optional addItemsTo?: QueuePosition;
```

Defined in: [async-queuer.ts:122](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L122)

Default position to add items to the queuer

#### Default

```ts
'back'
```

***

### asyncRetryerOptions?

```ts
optional asyncRetryerOptions?: AsyncRetryerOptions<(item) => Promise<any>>;
```

Defined in: [async-queuer.ts:117](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L117)

Options for configuring the underlying async retryer

***

### concurrency?

```ts
optional concurrency?: number | ((queuer) => number);
```

Defined in: [async-queuer.ts:128](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L128)

Maximum number of concurrent tasks to process.
Can be a number or a function that returns a number.

#### Default

```ts
1
```

***

### expirationDuration?

```ts
optional expirationDuration?: number;
```

Defined in: [async-queuer.ts:133](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L133)

Maximum time in milliseconds that an item can stay in the queue
If not provided, items will never expire

***

### getIsExpired?

```ts
optional getIsExpired?: (item, addedAt) => boolean;
```

Defined in: [async-queuer.ts:138](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L138)

Function to determine if an item has expired
If provided, this overrides the expirationDuration behavior

#### Parameters

##### item

`TValue`

##### addedAt

`number`

#### Returns

`boolean`

***

### getItemsFrom?

```ts
optional getItemsFrom?: QueuePosition;
```

Defined in: [async-queuer.ts:143](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L143)

Default position to get items from during processing

#### Default

```ts
'front'
```

***

### getPriority?

```ts
optional getPriority?: (item) => number;
```

Defined in: [async-queuer.ts:149](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L149)

Function to determine priority of items in the queuer
Higher priority items will be processed first
If not provided, will use static priority values attached to tasks

#### Parameters

##### item

`TValue`

#### Returns

`number`

***

### initialItems?

```ts
optional initialItems?: TValue[];
```

Defined in: [async-queuer.ts:153](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L153)

Initial items to populate the queuer with

***

### initialState?

```ts
optional initialState?: Partial<AsyncQueuerState<TValue>>;
```

Defined in: [async-queuer.ts:157](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L157)

Initial state for the async queuer

***

### key?

```ts
optional key?: string;
```

Defined in: [async-queuer.ts:162](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L162)

Optional key to identify this async queuer instance.
If provided, the async queuer will be identified by this key in the devtools and PacerProvider if applicable.

***

### maxSize?

```ts
optional maxSize?: number;
```

Defined in: [async-queuer.ts:166](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L166)

Maximum number of items allowed in the queuer

***

### onError?

```ts
optional onError?: (error, item, queuer) => void;
```

Defined in: [async-queuer.ts:172](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L172)

Optional error handler for when a task throws.
If provided, the handler will be called with the error and queuer instance.
This can be used alongside throwOnError - the handler will be called before any error is thrown.

#### Parameters

##### error

`Error`

##### item

`TValue`

##### queuer

[`AsyncQueuer`](../classes/AsyncQueuer.md)\<`TValue`\>

#### Returns

`void`

***

### onExpire?

```ts
optional onExpire?: (item, queuer) => void;
```

Defined in: [async-queuer.ts:176](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L176)

Callback fired whenever an item expires in the queuer

#### Parameters

##### item

`TValue`

##### queuer

[`AsyncQueuer`](../classes/AsyncQueuer.md)\<`TValue`\>

#### Returns

`void`

***

### onItemsChange?

```ts
optional onItemsChange?: (queuer) => void;
```

Defined in: [async-queuer.ts:180](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L180)

Callback fired whenever an item is added or removed from the queuer

#### Parameters

##### queuer

[`AsyncQueuer`](../classes/AsyncQueuer.md)\<`TValue`\>

#### Returns

`void`

***

### onReject?

```ts
optional onReject?: (item, queuer) => void;
```

Defined in: [async-queuer.ts:184](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L184)

Callback fired whenever an item is rejected from being added to the queuer

#### Parameters

##### item

`TValue`

##### queuer

[`AsyncQueuer`](../classes/AsyncQueuer.md)\<`TValue`\>

#### Returns

`void`

***

### onSettled?

```ts
optional onSettled?: (item, queuer) => void;
```

Defined in: [async-queuer.ts:188](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L188)

Optional callback to call when a task is settled

#### Parameters

##### item

`TValue`

##### queuer

[`AsyncQueuer`](../classes/AsyncQueuer.md)\<`TValue`\>

#### Returns

`void`

***

### onSuccess?

```ts
optional onSuccess?: (result, item, queuer) => void;
```

Defined in: [async-queuer.ts:192](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L192)

Optional callback to call when a task succeeds

#### Parameters

##### result

`any`

##### item

`TValue`

##### queuer

[`AsyncQueuer`](../classes/AsyncQueuer.md)\<`TValue`\>

#### Returns

`void`

***

### started?

```ts
optional started?: boolean;
```

Defined in: [async-queuer.ts:196](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L196)

Whether the queuer should start processing tasks immediately or not.

***

### throwOnError?

```ts
optional throwOnError?: boolean;
```

Defined in: [async-queuer.ts:202](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L202)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### wait?

```ts
optional wait?: number | ((queuer) => number);
```

Defined in: [async-queuer.ts:208](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L208)

Time in milliseconds to wait between processing items.
Can be a number or a function that returns a number.

#### Default

```ts
0
```
