---
id: PacerScope
title: PacerScope
---

Defined in: [provider/PacerProvider.ts:28](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/PacerProvider.ts#L28)

Lifecycle and reactive defaults owned by an Alpine component or element.

## Properties

### addCleanup

```ts
addCleanup: (cleanup) => void;
```

Defined in: [provider/PacerProvider.ts:31](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/PacerProvider.ts#L31)

#### Parameters

##### cleanup

() => `void`

#### Returns

`void`

***

### assertActive

```ts
assertActive: () => void;
```

Defined in: [provider/PacerProvider.ts:32](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/PacerProvider.ts#L32)

#### Returns

`void`

***

### defaultOptions

```ts
defaultOptions: () => PacerProviderOptions;
```

Defined in: [provider/PacerProvider.ts:29](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/PacerProvider.ts#L29)

#### Returns

[`PacerProviderOptions`](PacerProviderOptions.md)

***

### destroy

```ts
destroy: () => void;
```

Defined in: [provider/PacerProvider.ts:34](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/PacerProvider.ts#L34)

#### Returns

`void`

***

### destroyed

```ts
readonly destroyed: boolean;
```

Defined in: [provider/PacerProvider.ts:33](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/PacerProvider.ts#L33)

***

### effect

```ts
effect: (callback) => void;
```

Defined in: [provider/PacerProvider.ts:30](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/PacerProvider.ts#L30)

#### Parameters

##### callback

() => `void`

#### Returns

`void`
