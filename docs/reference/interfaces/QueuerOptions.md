---
id: QueuerOptions
title: QueuerOptions
---

# Interface: QueuerOptions\<TValue\>

Defined in: [queuer.ts:89](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L89)

Options for configuring a Queuer instance.

These options control queue behavior, item expiration, callbacks, and more.

## Type Parameters

### TValue

`TValue`

## Properties

### addItemsTo?

```ts
optional addItemsTo: QueuePosition;
```

Defined in: [queuer.ts:94](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L94)

Default position to add items to the queuer

#### Default

```ts
'back'
```

***

### deduplicateItems?

```ts
optional deduplicateItems: boolean;
```

Defined in: [queuer.ts:101](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L101)

Enable automatic deduplication of items across queue cycles
When enabled, items that have already been processed will be automatically skipped
The keys of processed items are tracked in state.processedKeys

#### Default

```ts
false
```

***

### deduplicateStrategy?

```ts
optional deduplicateStrategy: "keep-first" | "keep-last";
```

Defined in: [queuer.ts:109](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L109)

Strategy to use when a duplicate item is detected in the current queue
- 'keep-first': Keep the existing item and ignore the new one (default)
- 'keep-last': Replace the existing item with the new one
Note: This only affects duplicates within the same queue, not across executions

#### Default

```ts
'keep-first'
```

***

### expirationDuration?

```ts
optional expirationDuration: number;
```

Defined in: [queuer.ts:114](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L114)

Maximum time in milliseconds that an item can stay in the queue
If not provided, items will never expire

***

### getIsExpired()?

```ts
optional getIsExpired: (item, addedAt) => boolean;
```

Defined in: [queuer.ts:119](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L119)

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

### getItemKey()?

```ts
optional getItemKey: (item) => string | number;
```

Defined in: [queuer.ts:129](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L129)

Function to extract a unique key from each item for deduplication
If not provided, uses the item itself for primitives or JSON.stringify for objects

#### Parameters

##### item

`TValue`

#### Returns

`string` \| `number`

***

### getItemsFrom?

```ts
optional getItemsFrom: QueuePosition;
```

Defined in: [queuer.ts:124](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L124)

Default position to get items from during processing

#### Default

```ts
'front'
```

***

### getPriority()?

```ts
optional getPriority: (item) => number;
```

Defined in: [queuer.ts:134](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L134)

Function to determine priority of items in the queuer
Higher priority items will be processed first

#### Parameters

##### item

`TValue`

#### Returns

`number`

***

### initialItems?

```ts
optional initialItems: TValue[];
```

Defined in: [queuer.ts:138](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L138)

Initial items to populate the queuer with

***

### initialState?

```ts
optional initialState: Partial<QueuerState<TValue>>;
```

Defined in: [queuer.ts:142](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L142)

Initial state for the queuer

***

### key?

```ts
optional key: string;
```

Defined in: [queuer.ts:147](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L147)

Optional key to identify this queuer instance.
If provided, the queuer will be identified by this key in the devtools and PacerProvider if applicable.

***

### maxSize?

```ts
optional maxSize: number;
```

Defined in: [queuer.ts:151](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L151)

Maximum number of items allowed in the queuer

***

### maxTrackedKeys?

```ts
optional maxTrackedKeys: number;
```

Defined in: [queuer.ts:158](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L158)

Maximum number of processed keys to track (prevents memory leaks)
When limit is reached, oldest keys are removed (FIFO)
Only used when deduplicateItems is enabled

#### Default

```ts
1000
```

***

### onDuplicate()?

```ts
optional onDuplicate: (newItem, existingItem, queuer) => void;
```

Defined in: [queuer.ts:163](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L163)

Callback fired when a duplicate item is detected
Called both for in-queue duplicates and cross-execution duplicates

#### Parameters

##### newItem

`TValue`

##### existingItem

`TValue` | `undefined`

##### queuer

[`Queuer`](../classes/Queuer.md)\<`TValue`\>

#### Returns

`void`

***

### onExecute()?

```ts
optional onExecute: (item, queuer) => void;
```

Defined in: [queuer.ts:171](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L171)

Callback fired whenever an item is removed from the queuer

#### Parameters

##### item

`TValue`

##### queuer

[`Queuer`](../classes/Queuer.md)\<`TValue`\>

#### Returns

`void`

***

### onExpire()?

```ts
optional onExpire: (item, queuer) => void;
```

Defined in: [queuer.ts:175](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L175)

Callback fired whenever an item expires in the queuer

#### Parameters

##### item

`TValue`

##### queuer

[`Queuer`](../classes/Queuer.md)\<`TValue`\>

#### Returns

`void`

***

### onItemsChange()?

```ts
optional onItemsChange: (queuer) => void;
```

Defined in: [queuer.ts:179](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L179)

Callback fired whenever an item is added or removed from the queuer

#### Parameters

##### queuer

[`Queuer`](../classes/Queuer.md)\<`TValue`\>

#### Returns

`void`

***

### onReject()?

```ts
optional onReject: (item, queuer) => void;
```

Defined in: [queuer.ts:183](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L183)

Callback fired whenever an item is rejected from being added to the queuer

#### Parameters

##### item

`TValue`

##### queuer

[`Queuer`](../classes/Queuer.md)\<`TValue`\>

#### Returns

`void`

***

### started?

```ts
optional started: boolean;
```

Defined in: [queuer.ts:187](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L187)

Whether the queuer should start processing tasks immediately

***

### wait?

```ts
optional wait: number | (queuer) => number;
```

Defined in: [queuer.ts:193](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L193)

Time in milliseconds to wait between processing items.
Can be a number or a function that returns a number.

#### Default

```ts
0
```
