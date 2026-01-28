---
id: PreactThrottler
title: PreactThrottler
---

# Interface: PreactThrottler\<TFn, TSelected\>

Defined in: [preact-pacer/src/throttler/useThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/throttler/useThrottler.ts#L13)

## Extends

- `Omit`\<`Throttler`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [preact-pacer/src/throttler/useThrottler.ts:39](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/throttler/useThrottler.ts#L39)

Reactive state that will be updated and re-rendered when the throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<ThrottlerState<TFn>>>;
```

Defined in: [preact-pacer/src/throttler/useThrottler.ts:45](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/throttler/useThrottler.ts#L45)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ComponentChildren;
```

Defined in: [preact-pacer/src/throttler/useThrottler.ts:30](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/throttler/useThrottler.ts#L30)

A Preact HOC (Higher Order Component) that allows you to subscribe to the throttler state.

This is useful for opting into state re-renders for specific parts of the throttler state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ComponentChildren` \| (`state`) => `ComponentChildren`

###### selector

(`state`) => `TSelected`

#### Returns

`ComponentChildren`

#### Example

```ts
<throttler.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {({ isPending }) => (
    <div>{isPending ? 'Loading...' : 'Ready'}</div>
  )}
</throttler.Subscribe>
```
