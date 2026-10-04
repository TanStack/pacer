---
id: UseThrottledCallback
title: UseThrottledCallback
---

Defined in: [packages/ember-pacer/src/throttler/useThrottledCallback.ts:15](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledCallback.ts#L15)

Returns a throttled callback from an owned Ember helper. Named arguments update the same utility.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberThrottler`](../interfaces/EmberThrottler.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
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
new UseThrottledCallback<TFn, TSelected>(owner?): UseThrottledCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseThrottledCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: ThrottlerState<TFn>) => TSelected]
    Named: EmberThrottlerOptions<TFn, TSelected>
  }
  Return: EmberThrottler<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => void;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottledCallback.ts:31](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledCallback.ts#L31)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): void;
```

Attempts to execute the throttled function. The execution behavior depends on the throttler options:

- If enough time has passed since the last execution (>= wait period):
  - With leading=true: Executes immediately
  - With leading=false: Waits for the next trailing execution

- If within the wait period:
  - With trailing=true: Schedules execution for end of wait period
  - With trailing=false: Drops the execution

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`void`

##### Example

```ts
const throttled = new Throttler(fn, { wait: 1000 });

// First call executes immediately
throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
throttled.maybeExecute('c', 'd');
```

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
