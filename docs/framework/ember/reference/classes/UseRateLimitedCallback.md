---
id: UseRateLimitedCallback
title: UseRateLimitedCallback
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedCallback.ts:18](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedCallback.ts#L18)

Returns a ratelimited callback from an owned Ember helper. Named arguments update the same utility.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberRateLimiterOptions`](../interfaces/EmberRateLimiterOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberRateLimiter`](../interfaces/EmberRateLimiter.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
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
new UseRateLimitedCallback<TFn, TSelected>(owner?): UseRateLimitedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseRateLimitedCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: RateLimiterState) => TSelected]
    Named: EmberRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberRateLimiter<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => boolean;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedCallback.ts:34](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedCallback.ts#L34)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberRateLimiterOptions`](../interfaces/EmberRateLimiterOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): boolean;
```

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`boolean`

##### Example

```ts
const rateLimiter = new RateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will return true
rateLimiter.maybeExecute('arg1', 'arg2'); // true

// Additional calls within the window will return false
rateLimiter.maybeExecute('arg1', 'arg2'); // false
```

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
