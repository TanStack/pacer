---
id: createPacerScope
title: createPacerScope
---

```ts
function createPacerScope(defaultOptions?): object;
```

Defined in: [provider/createPacerScope.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/createPacerScope.ts#L26)

Creates typed Pacer factories sharing an Alpine lifecycle and reactive defaults.

## Parameters

### defaultOptions?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`PacerProviderOptions`](../interfaces/PacerProviderOptions.md)\> = `{}`

## Returns

`object`

### destroy

```ts
destroy: () => void = scope.destroy;
```

#### Returns

`void`

### destroyed

#### Get Signature

```ts
get destroyed(): boolean;
```

##### Returns

`boolean`

### createAsyncBatcher()

```ts
createAsyncBatcher<TValue, TSelected>(
   fn,
   options?,
selector?): AlpineAsyncBatcher<TValue, TSelected>;
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

(`items`) => `Promise`\<`any`\>

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncBatcherOptions`](../interfaces/AlpineAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncBatcher`](../interfaces/AlpineAsyncBatcher.md)\<`TValue`, `TSelected`\>

### createAsyncDebouncer()

```ts
createAsyncDebouncer<TFn, TSelected>(
   fn,
   options,
selector?): AlpineAsyncDebouncer<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyAsyncFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncDebouncerOptions`](../interfaces/AlpineAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncDebouncer`](../interfaces/AlpineAsyncDebouncer.md)\<`TFn`, `TSelected`\>

### createAsyncQueuedState()

```ts
createAsyncQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [() => TValue[], AlpineAsyncQueuer<TValue, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

#### Parameters

##### fn

(`item`) => `Promise`\<`any`\>

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncQueuerOptions`](../interfaces/AlpineAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

\[() => `TValue`[], [`AlpineAsyncQueuer`](../interfaces/AlpineAsyncQueuer.md)\<`TValue`, `TSelected`\>\]

### createAsyncQueuer()

```ts
createAsyncQueuer<TValue, TSelected>(
   fn,
   options?,
selector?): AlpineAsyncQueuer<TValue, TSelected>;
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

(`item`) => `Promise`\<`any`\>

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncQueuerOptions`](../interfaces/AlpineAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncQueuer`](../interfaces/AlpineAsyncQueuer.md)\<`TValue`, `TSelected`\>

### createAsyncRateLimiter()

```ts
createAsyncRateLimiter<TFn, TSelected>(
   fn,
   options,
selector?): AlpineAsyncRateLimiter<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyAsyncFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncRateLimiterOptions`](../interfaces/AlpineAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncRateLimiter`](../interfaces/AlpineAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

### createAsyncThrottler()

```ts
createAsyncThrottler<TFn, TSelected>(
   fn,
   options,
selector?): AlpineAsyncThrottler<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyAsyncFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncThrottlerOptions`](../interfaces/AlpineAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncThrottler`](../interfaces/AlpineAsyncThrottler.md)\<`TFn`, `TSelected`\>

### createBatcher()

```ts
createBatcher<TValue, TSelected>(
   fn,
   options?,
selector?): AlpineBatcher<TValue, TSelected>;
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

(`items`) => `void`

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineBatcherOptions`](../interfaces/AlpineBatcherOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineBatcher`](../interfaces/AlpineBatcher.md)\<`TValue`, `TSelected`\>

### createDebouncedState()

```ts
createDebouncedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, AlpineDebouncer<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### initialValue

`TValue`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`AlpineDebouncer`](../interfaces/AlpineDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createDebouncedValue()

```ts
createDebouncedValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, AlpineDebouncer<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### source

`ValueSource`\<`TValue`\>

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, [`AlpineDebouncer`](../interfaces/AlpineDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createDebouncer()

```ts
createDebouncer<TFn, TSelected>(
   fn,
   options,
selector?): AlpineDebouncer<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineDebouncer`](../interfaces/AlpineDebouncer.md)\<`TFn`, `TSelected`\>

### createQueuedState()

```ts
createQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, AlpineQueuer<TValue, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

#### Parameters

##### fn

(`item`) => `void`

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineQueuerOptions`](../interfaces/AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`AlpineQueuer`](../interfaces/AlpineQueuer.md)\<`TValue`, `TSelected`\>\]

### createQueuedValue()

```ts
createQueuedValue<TValue, TSelected>(
   source,
   options?,
   selector?): [CellValue<TValue>, AlpineQueuer<TValue, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### source

`ValueSource`\<`TValue`\>

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineQueuerOptions`](../interfaces/AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, [`AlpineQueuer`](../interfaces/AlpineQueuer.md)\<`TValue`, `TSelected`\>\]

### createQueuer()

```ts
createQueuer<TValue, TSelected>(
   fn,
   options?,
selector?): AlpineQueuer<TValue, TSelected>;
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

(`item`) => `void`

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineQueuerOptions`](../interfaces/AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineQueuer`](../interfaces/AlpineQueuer.md)\<`TValue`, `TSelected`\>

### createRateLimitedState()

```ts
createRateLimitedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, AlpineRateLimiter<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### initialValue

`TValue`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createRateLimitedValue()

```ts
createRateLimitedValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, AlpineRateLimiter<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### source

`ValueSource`\<`TValue`\>

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, [`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createRateLimiter()

```ts
createRateLimiter<TFn, TSelected>(
   fn,
   options,
selector?): AlpineRateLimiter<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`TFn`, `TSelected`\>

### createThrottledState()

```ts
createThrottledState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, AlpineThrottler<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### initialValue

`TValue`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`AlpineThrottler`](../interfaces/AlpineThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createThrottledValue()

```ts
createThrottledValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, AlpineThrottler<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### source

`ValueSource`\<`TValue`\>

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, [`AlpineThrottler`](../interfaces/AlpineThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createThrottler()

```ts
createThrottler<TFn, TSelected>(
   fn,
   options,
selector?): AlpineThrottler<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineThrottler`](../interfaces/AlpineThrottler.md)\<`TFn`, `TSelected`\>
