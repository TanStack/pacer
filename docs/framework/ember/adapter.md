---
title: Ember Adapter
id: adapter
---

The `ember-pacer` adapter connects Pacer scheduling utilities to Ember state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/ember-pacer
```

The package is ESM-only and requires Node.js 20 or newer when running in Node.js.

## Lifecycle and state

Call the `use*` template helpers inside a `{{#let}}` block. The execution callback is the first positional argument and the optional state selector is the second. Pass options as named arguments. Ember tracks named arguments and updates the same utility after rendering. Removing the helper from the template releases its subscriptions and cleans up pending work.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility | Instance API | Convenience APIs |
| --- | --- | --- |
| [batching](./guides/batching.md) | `useBatcher` | `useBatchedCallback` |
| [debouncing](./guides/debouncing.md) | `useDebouncer` | `useDebouncedCallback`, `useDebouncedState`, `useDebouncedValue` |
| [queuing](./guides/queuing.md) | `useQueuer` | `useQueuedState`, `useQueuedValue` |
| [rate limiting](./guides/rate-limiting.md) | `useRateLimiter` | `useRateLimitedCallback`, `useRateLimitedState`, `useRateLimitedValue` |
| [throttling](./guides/throttling.md) | `useThrottler` | `useThrottledCallback`, `useThrottledState`, `useThrottledValue` |
| [async batching](./guides/async-batching.md) | `useAsyncBatcher` | `useAsyncBatchedCallback` |
| [async debouncing](./guides/async-debouncing.md) | `useAsyncDebouncer` | `useAsyncDebouncedCallback` |
| [async queuing](./guides/async-queuing.md) | `useAsyncQueuer` | `useAsyncQueuedState` |
| [async rate limiting](./guides/async-rate-limiting.md) | `useAsyncRateLimiter` | `useAsyncRateLimitedCallback` |
| [async throttling](./guides/async-throttling.md) | `useAsyncThrottler` | `useAsyncThrottledCallback` |

## Example

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { DebouncerState } from '@tanstack/ember-pacer'
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  @tracked input = 'hello'
  @tracked wait = 200
  @tracked history: Array<string> = []
  execute = (value: string) => { this.history = [...this.history, value] }
  select = (state: DebouncerState<(value: string) => void>) => state
  updateInput = (event: Event) => { this.input = (event.target as HTMLInputElement).value }
  updateWait = (event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }
  clear = () => { this.history = [] }
  burst = (schedule: (value: string) => unknown) => { for (let i = 1; i <= 3; i++) void schedule(`${this.input} ${i}`) }
  <template>
{{#let (useDebouncer this.execute this.select wait=this.wait) as |utility|}}
<main>
<h1>Ember useDebouncer</h1><p>Wait until typing stops, then execute the latest call.</p>
<label>Task <input value={{this.input}} {{on "input" this.updateInput}} /></label><label>Wait (ms) <input value={{this.wait}} {{on "input" this.updateWait}} type="number" min="0" /></label>
<div><button {{on "click" (fn utility.maybeExecute this.input)}}>Schedule</button><button {{on "click" (fn this.burst utility.maybeExecute)}}>Schedule three</button><button {{on "click" utility.flush}}>Flush</button><button {{on "click" utility.cancel}}>Cancel</button><button {{on "click" this.clear}}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{{json this.history}}</pre></section>
<section><h2>Utility state</h2><pre>{{json utility.state}}</pre></section>
<p class="caption">Tracked named arguments update the same utility. The helper owns cleanup when it leaves the template.</p>
</main>
{{/let}}
  </template>
}
```

## Reactive options

Pass tracked values directly as named arguments, for example `wait=this.wait`. A scope created by `createPacerScope(() => defaults)` supplies contextual helpers with shared defaults. Pass the scope through component arguments to share it. Local named options take precedence.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

`createPacerScope` returns typed contextual helpers. Invoke `scope.useDebouncer` with normal positional and named arguments. Scope defaults can be a factory or an object with getters. Each helper owns its cleanup.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Callback and value helpers

Callback helpers return only the scheduled function. Use an instance API when you need `flush`, `cancel`, queue controls, or state subscriptions.

State and value helpers return an object with `value`, `setValue`, and `utility`. Read `value` in the template so Ember tracks it. State helpers initialize once; value helpers process changes to their positional input. Queue state helpers return the queue with `items` selected by default.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

The utilities emit the same Pacer devtools events as the other adapters. Use the framework-independent `@tanstack/pacer-devtools` panel when your application supplies a devtools host.

## API reference

See the [generated reference](./reference/index.md) for signatures, options, and return types.
