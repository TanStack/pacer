---
id: EmberDebouncedValue
title: EmberDebouncedValue
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedValue.ts:15](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedValue.ts#L15)

Reactive value, update method, and underlying utility returned by useDebouncedValue.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### setValue

```ts
setValue: (value) => void;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedValue.ts:17](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedValue.ts#L17)

#### Parameters

##### value

`TValue`

#### Returns

`void`

***

### utility

```ts
utility: EmberDebouncer<(value) => void, TSelected>;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedValue.ts:18](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedValue.ts#L18)

***

### value

```ts
readonly value: TValue;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedValue.ts:16](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedValue.ts#L16)
