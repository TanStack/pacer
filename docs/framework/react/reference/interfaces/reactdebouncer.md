---
id: ReactDebouncer
title: ReactDebouncer
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Interface: ReactDebouncer\<TFn, TSelected\>

Defined in: [react-pacer/src/debouncer/useDebouncer.ts:10](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L10)

## Extends

- `Omit`\<`Debouncer`\<`TFn`\>, `"store"`\>

## Type Parameters

• **TFn** *extends* `AnyFunction`

• **TSelected** = `DebouncerState`\<`TFn`\>

## Properties

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [react-pacer/src/debouncer/useDebouncer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L19)

Reactive state that will be updated and re-rendered when the debouncer state changes

Use this instead of `debouncer.store.state`
