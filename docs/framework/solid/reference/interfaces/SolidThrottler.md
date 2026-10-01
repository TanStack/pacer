---
id: SolidThrottler
title: SolidThrottler
---

Defined in: [throttler/createThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L26)

## Extends

- `Omit`\<`Throttler`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: ThrottlerOptions<TFn> & SolidThrottlerOptions<TFn, TSelected>;
```

Defined in: [throttler/createThrottler.ts:30](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L30)

#### Overrides

```ts
Omit.options
```

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/createThrottler.ts:31](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L31)

Updates the throttler options

#### Parameters

##### options

`Partial`\<[`SolidThrottlerOptions`](SolidThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

#### Overrides

```ts
Omit.setOptions
```

***

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [throttler/createThrottler.ts:55](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L55)

Reactive state that will be updated when the throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<ThrottlerState<TFn>>>;
```

Defined in: [throttler/createThrottler.ts:61](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L61)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [throttler/createThrottler.ts:46](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L46)

A Solid component that allows you to subscribe to the throttler state.

This is useful for tracking specific parts of the throttler state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`Element` \| ((`state`) => `Element`)

###### selector

(`state`) => `TSelected`

#### Returns

`Element`

#### Example

```ts
<throttler.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {(state) => (
    <div>{state().isPending ? 'Loading...' : 'Ready'}</div>
  )}
</throttler.Subscribe>
```
