---
id: UseDebouncedCallback
title: UseDebouncedCallback
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedCallback.ts:15](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedCallback.ts#L15)

Returns a debounced callback from an owned Ember helper. Named arguments update the same utility.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberDebouncer`](../interfaces/EmberDebouncer.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
\}\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new UseDebouncedCallback<TFn, TSelected>(owner?): UseDebouncedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseDebouncedCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: DebouncerState<TFn>) => TSelected]
    Named: EmberDebouncerOptions<TFn, TSelected>
  }
  Return: EmberDebouncer<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => void;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedCallback.ts:31](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedCallback.ts#L31)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): void;
```

Attempts to execute the debounced function
If a call is already in progress, it will be queued

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`void`

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
