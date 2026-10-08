# Angular adapter breaking changes

Changes from the previous Angular adapter on upstream main.

## Angular version

Angular 20 or newer is required. Angular 17–19 are no longer supported.

## API renames

| Previous API                         | Replacement                 |
| ------------------------------------ | --------------------------- |
| `injectDebouncedValue`               | `injectDebouncedComputed`   |
| `injectThrottledValue`               | `injectThrottledComputed`   |
| `injectRateLimitedValue`             | `injectRateLimitedComputed` |
| `injectQueuedValue`                  | `injectQueuedComputed`      |
| `injectQueuedSignal` (pending items) | `injectQueuerItems`         |
| `injectAsyncQueuedSignal`            | `injectAsyncQueuerItems`    |

`injectQueuedSignal` now creates an editable scalar signal. Old calls that pass
an item-processing callback must migrate to `injectQueuerItems`.

## Utility refs

Refs expose their selected `state()` signal and explicit methods. They no longer
expose the full core instance: `fn`, `key`, `options`, `store`, and `setOptions`
are removed. Read state through a selector and change options through an options
factory:

```ts
const wait = signal(100)
const debouncer = injectDebouncer(
  callback,
  () => ({ wait: wait() }),
  (state) => ({
    isPending: state.isPending,
  }),
)
wait.set(200) // Replaces debouncer.setOptions({ wait: 200 }).
```

`onUnmount` now receives the core Pacer instance rather than the Angular ref.
Read `core.store.state` inside that callback instead of `ref.state()`.

A caller-selected state type requires a selector argument. Calls that specify
`TSelected` without providing a selector no longer compile.

## Editable signal writes

For debounced, throttled, and rate-limited signals, replace updater calls to
`set` with `update`:

```ts
value.set((previous) => previous + 1) // Previous API.
value.update((previous) => previous + 1) // Current API.
```

These helpers now queue callbacks internally. Their attached utility accepts a
callback in `maybeExecute`, and item-dependent options and selected fields such
as `lastArgs` contain that callback rather than the replacement value.
Use the signal's `set` and `update` methods for value writes.

## Computed helpers

Computed helpers take `(source, options, selector?)`. Overloads accepting a
separate initial value are removed; the first read returns the source value.
They return readonly signals with an attached utility rather than the editable
signal refs returned by the previous debounced, throttled, and rate-limited value
helpers. Write to the source instead of calling `set` on the computed result.

For queued computed values, replace `value.addItem(item)` with
`value.queuer.addItem(item)`. The shortcut remains on the items helpers.

## Pending items

Items helpers return `ReadonlyArray<TValue>` rather than mutable arrays.
Without a selector, their attached `queuer.state()` now returns `{}`, rather
than `{ items }`. Read waiting items from the items signal, or explicitly select
additional state:

```ts
const items = injectQueuerItems(processItem, { started: false }, (state) => ({
  size: state.size,
}))
items.addItem('job')
items() // Waiting items.
items.queuer.state().size // Selected state.
```

Selectors no longer have to include an `items` field.

## Public types and imports

| Previous type                     | Replacement                               |
| --------------------------------- | ----------------------------------------- |
| `DebouncedSignal<T, TSelected>`   | `AngularDebouncerSignal<T, TSelected>`    |
| `ThrottledSignal<T, TSelected>`   | `AngularThrottlerSignal<T, TSelected>`    |
| `RateLimitedSignal<T, TSelected>` | `AngularRateLimiterSignal<T, TSelected>`  |
| `QueuedSignal<T, TSelected>`      | `AngularQueuerItems<T, TSelected>`        |
| `AsyncQueuedSignal<T, TSelected>` | `AngularAsyncQueuerItems<T, TSelected>`   |
| `QueuedValueSignal<T, TSelected>` | `AngularQueuerComputed<T, TSelected>`     |
| `AngularPacerOptions<T>`          | Use `T \| (() => T)` in application types |

Computed helpers use their corresponding `AngularDebouncerComputed`,
`AngularThrottlerComputed`, and `AngularRateLimiterComputed` types.

`Angular*Options` types no longer take a `TSelected` generic argument; selection
belongs to the utility ref. `PACER_OPTIONS` is no longer exported from the
provider entry point. Use `providePacerOptions` to configure defaults and
`injectPacerOptions` to read them.
