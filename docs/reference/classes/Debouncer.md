---
id: Debouncer
title: Debouncer
---

# Class: Debouncer\<TFn\>

Defined in: [debouncer.ts:148](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L148)

A class that creates a debounced function.

Debouncing ensures that a function is only executed after a certain amount of time has passed
since its last invocation. This is useful for handling frequent events like window resizing,
scroll events, or input changes where you want to limit the rate of execution.
This synchronous version is lighter weight and often all you need - upgrade to AsyncDebouncer when you need promises, retry support, abort/cancel capabilities, or advanced error handling.

The debounced function can be configured to execute either at the start of the delay period
(leading edge) or at the end (trailing edge, default). Each new call during the wait period
will reset the timer.

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the debouncer
- Use `onExecute` callback to react to function execution and implement custom logic
- The state includes canLeadingExecute, execution count, and isPending status
- State can be accessed via `debouncer.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `debouncer.state`

## Example

```ts
const debouncer = new Debouncer((value: string) => {
  saveToDatabase(value);
}, { wait: 500 });

// Will only save after 500ms of no new input
inputElement.addEventListener('input', () => {
  debouncer.maybeExecute(inputElement.value);
});
```

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../type-aliases/AnyFunction.md)

## Constructors

### Constructor

```ts
new Debouncer<TFn>(fn, initialOptions): Debouncer<TFn>;
```

Defined in: [debouncer.ts:156](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L156)

#### Parameters

##### fn

`TFn`

##### initialOptions

[`DebouncerOptions`](../interfaces/DebouncerOptions.md)\<`TFn`\>

#### Returns

`Debouncer`\<`TFn`\>

## Properties

### fn

```ts
fn: TFn;
```

Defined in: [debouncer.ts:157](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L157)

***

### key

```ts
key: string | undefined;
```

Defined in: [debouncer.ts:152](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L152)

***

### options

```ts
options: DebouncerOptions<TFn>;
```

Defined in: [debouncer.ts:153](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L153)

***

### store

```ts
readonly store: Store<Readonly<DebouncerState<TFn>>>;
```

Defined in: [debouncer.ts:149](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L149)

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [debouncer.ts:289](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L289)

Cancels any pending execution

#### Returns

`void`

***

### flush()

```ts
flush(): void;
```

Defined in: [debouncer.ts:272](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L272)

Processes the current pending execution immediately

#### Returns

`void`

***

### maybeExecute()

```ts
maybeExecute(...args): void;
```

Defined in: [debouncer.ts:225](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L225)

Attempts to execute the debounced function
If a call is already in progress, it will be queued

#### Parameters

##### args

...`Parameters`\<`TFn`\>

#### Returns

`void`

***

### reset()

```ts
reset(): void;
```

Defined in: [debouncer.ts:300](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L300)

Resets the debouncer state to its default values

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [debouncer.ts:179](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L179)

Updates the debouncer options

#### Parameters

##### newOptions

`Partial`\<[`DebouncerOptions`](../interfaces/DebouncerOptions.md)\<`TFn`\>\>

#### Returns

`void`
