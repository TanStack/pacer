---
id: DebouncedSignal
title: DebouncedSignal
---

# Interface: DebouncedSignal\<TValue, TSelected\>

Defined in: [angular-pacer/src/debouncer/createDebouncedSignal.ts:12](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/createDebouncedSignal.ts#L12)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### debouncer

```ts
readonly debouncer: AngularDebouncer<Setter<TValue>, TSelected>;
```

Defined in: [angular-pacer/src/debouncer/createDebouncedSignal.ts:24](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/createDebouncedSignal.ts#L24)

The debouncer instance with additional control methods and state signals

***

### setValue

```ts
readonly setValue: Setter<TValue>;
```

Defined in: [angular-pacer/src/debouncer/createDebouncedSignal.ts:20](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/createDebouncedSignal.ts#L20)

Function to update the debounced value

***

### value

```ts
readonly value: Signal<TValue>;
```

Defined in: [angular-pacer/src/debouncer/createDebouncedSignal.ts:16](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/createDebouncedSignal.ts#L16)

The current debounced value signal
