---
title: Ember Quick Start
id: quick-start
redirectFrom:
  - framework/ember/adapter
---

TanStack Pacer controls when your functions run. The Ember adapter, `@tanstack/ember-pacer`, provides each Pacer utility as a template helper. Invoke the helper inside a `{{#let}}` block. The helper keeps one utility instance while it stays in the template, tracks the state you select, and cleans up pending work when it leaves the template.

This page starts with a debounced search input, then covers the patterns most apps need next. The examples use `.gts` components.

## Installation

```sh
npm install @tanstack/ember-pacer
```

The adapter re-exports everything from `@tanstack/pacer`, so you do not need to install the core package. See [Installation](../../installation.md) for other package managers.

## Your first debouncer

The component below is complete. The input updates on every keystroke. `debounced.value` updates 500 ms after the user stops typing.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { useDebouncedValue } from '@tanstack/ember-pacer'

export default class Search extends Component {
  @tracked query = ''

  updateQuery = (event: Event) => {
    this.query = (event.target as HTMLInputElement).value
  }

  <template>
    {{#let (useDebouncedValue this.query wait=500) as |debounced|}}
      <input
        value={{this.query}}
        placeholder='Search...'
        {{on 'input' this.updateQuery}}
      />
      <p>Searching for: {{debounced.value}}</p>
    {{/let}}
  </template>
}
```

Positional arguments come first: the value for value helpers, or the function for instance helpers. Options are named arguments, such as `wait=500`. Pass `debounced.value` to your data fetching instead of `query`, and a fast typist sends one request instead of one per keystroke.

## Pick a helper

Every utility comes in several shapes. They share one engine and differ in what they hand back to you. For debouncing:

| Helper              | Returns                                           | Use it when                                                   |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `useDebouncedValue` | An object with `value`, `setValue`, and `utility` | You already have a tracked value and want a lagging copy      |
| `useDebouncedState` | An object with `value`, `setValue`, and `utility` | You want a value with a debounced setter                      |
| `useDebouncer`      | The debouncer instance                            | You need `maybeExecute`, `flush`, `cancel`, or reactive state |

`useDebouncedValue` follows changes to its positional argument. `useDebouncedState` takes an initial value once and changes only through `setValue`.

The other utilities follow the same naming pattern:

| Utility       | Instance helper  | Async instance helper | Guide                                      |
| ------------- | ---------------- | --------------------- | ------------------------------------------ |
| Debouncing    | `useDebouncer`   | `useAsyncDebouncer`   | [Debouncing](./guides/debouncing.md)       |
| Throttling    | `useThrottler`   | `useAsyncThrottler`   | [Throttling](./guides/throttling.md)       |
| Rate limiting | `useRateLimiter` | `useAsyncRateLimiter` | [Rate Limiting](./guides/rate-limiting.md) |
| Queuing       | `useQueuer`      | `useAsyncQueuer`      | [Queuing](./guides/queuing.md)             |
| Batching      | `useBatcher`     | `useAsyncBatcher`     | [Batching](./guides/batching.md)           |

Not sure which utility you need? Read [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md).

## Common patterns

### Control the debouncer directly

`useDebouncer` returns the instance. Pass it to your event handler with `fn`, call `maybeExecute`, and use `flush` or `cancel` when the user acts before the timer fires.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { fn } from '@ember/helper'
import { on } from '@ember/modifier'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { DebouncerState, EmberDebouncer } from '@tanstack/ember-pacer'

type Save = (text: string) => void

export default class DraftEditor extends Component {
  @tracked draft = ''

  save: Save = (text) => saveDraft(text)

  select = (state: DebouncerState<Save>) => ({ isPending: state.isPending })

  onInput = (saver: EmberDebouncer<Save>, event: Event) => {
    this.draft = (event.target as HTMLTextAreaElement).value
    saver.maybeExecute(this.draft)
  }

  <template>
    {{#let (useDebouncer this.save this.select wait=1000) as |saver|}}
      <textarea
        value={{this.draft}}
        {{on 'input' (fn this.onInput saver)}}
      ></textarea>
      <button type='button' {{on 'click' saver.flush}}>Save now</button>
      <button type='button' {{on 'click' saver.cancel}}>Discard</button>
      {{#if saver.state.isPending}}
        <p>Unsaved changes...</p>
      {{/if}}
    {{/let}}
  </template>
}
```

### Select the state you render

The second positional argument is a selector. Read the selected fields from `saver.state`. Without a selector, it is `{}` and never changes. Select only the fields your template reads.

To read state in one part of the template without a selector on the utility, invoke the `Subscribe` helper on the instance. Only that part of the template tracks the selection:

```hbs
{{#let (saver.Subscribe this.select) as |status|}}
  {{#if status.isPending}}<span>Saving...</span>{{/if}}
{{/let}}
```

Each utility's guide lists the state fields it exposes.

### Make options reactive

Named arguments are already tracked. Pass a tracked property, and the helper updates the same utility after it changes:

```hbs
{{#let
  (useDebouncer this.search wait=this.wait enabled=this.isEnabled)
  as |searcher|
}}
  ...
{{/let}}
```

Pending work and state survive an option change. A changed `wait` applies to the next call. It does not reschedule a timer that is already running. Setting `enabled` to `false` cancels pending work. `key`, `initialState`, and `initialItems` apply only when the helper creates the utility.

### Run async work

The async helpers await your function, track execution state, and report errors. This search debounces the request and shows a loading state:

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { fn } from '@ember/helper'
import { on } from '@ember/modifier'
import { useAsyncDebouncer } from '@tanstack/ember-pacer'
import type {
  AsyncDebouncerState,
  EmberAsyncDebouncer,
} from '@tanstack/ember-pacer'

type Search = (term: string) => Promise<Array<SearchResult>>

export default class AsyncSearch extends Component {
  @tracked results: Array<SearchResult> = []

  search: Search = async (term) => {
    const data = await fetchSearchResults(term)
    this.results = data
    return data
  }

  select = (state: AsyncDebouncerState<Search>) => ({
    isExecuting: state.isExecuting,
  })

  onError = (error: Error) => console.error('Search failed:', error)

  onInput = (searcher: EmberAsyncDebouncer<Search>, event: Event) => {
    searcher.maybeExecute((event.target as HTMLInputElement).value)
  }

  <template>
    {{#let
      (useAsyncDebouncer this.search this.select wait=300 onError=this.onError)
      as |searcher|
    }}
      <input {{on 'input' (fn this.onInput searcher)}} />
      {{#if searcher.state.isExecuting}}
        <p>Loading...</p>
      {{/if}}
      <ul>
        {{#each this.results key='id' as |result|}}
          <li>{{result.title}}</li>
        {{/each}}
      </ul>
    {{/let}}
  </template>
}
```

`maybeExecute` returns a promise that resolves with your function's result. The async utilities also support retries and cancellation through an `AbortSignal`. See the [Async Debouncing Guide](./guides/async-debouncing.md).

### Limit how often an action runs

A rate limiter allows a fixed number of calls per window and rejects the rest:

```gts
import Component from '@glimmer/component'
import { fn } from '@ember/helper'
import { on } from '@ember/modifier'
import { useRateLimiter } from '@tanstack/ember-pacer'
import type { RateLimiter, RateLimiterState } from '@tanstack/ember-pacer'

type Send = (message: string) => void

export default class SendButton extends Component {
  send: Send = (message) => sendMessage(message)

  select = (state: RateLimiterState) => ({
    rejectionCount: state.rejectionCount,
  })

  onReject = (limiter: RateLimiter<Send>) =>
    alert(`Slow down. Try again in ${limiter.getMsUntilNextWindow()} ms.`)

  <template>
    {{#let
      (useRateLimiter
        this.send this.select limit=5 window=60000 onReject=this.onReject
      )
      as |limiter|
    }}
      <button type='button' {{on 'click' (fn limiter.maybeExecute 'Hello')}}>
        Send
      </button>
      <p>Rejected: {{limiter.state.rejectionCount}}</p>
    {{/let}}
  </template>
}
```

### Process items in order

A queuer keeps every item and processes them in order. With `useAsyncQueuer`, `concurrency` sets how many run at once:

```gts
import Component from '@glimmer/component'
import { fn } from '@ember/helper'
import { on } from '@ember/modifier'
import { useAsyncQueuer } from '@tanstack/ember-pacer'
import type { AsyncQueuerState, EmberAsyncQueuer } from '@tanstack/ember-pacer'

export default class Uploader extends Component {
  upload = (file: File) => uploadFile(file)

  select = (state: AsyncQueuerState<File>) => ({
    size: state.size,
    activeCount: state.activeItems.length,
  })

  onFiles = (queue: EmberAsyncQueuer<File>, event: Event) => {
    const files = (event.target as HTMLInputElement).files
    for (const file of files ?? []) queue.addItem(file)
  }

  <template>
    {{#let (useAsyncQueuer this.upload this.select concurrency=3) as |queue|}}
      <input type='file' multiple {{on 'change' (fn this.onFiles queue)}} />
      <p>
        Uploading
        {{queue.state.activeCount}}, waiting
        {{queue.state.size}}
      </p>
    {{/let}}
  </template>
}
```

## Set default options

`createPacerScope` returns a set of helpers that share default options. Invoke the scope's helpers the same way as the top-level helpers. Named arguments override the defaults.

```gts
import Component from '@glimmer/component'
import { createPacerScope } from '@tanstack/ember-pacer'

export default class App extends Component {
  pacer = createPacerScope({
    debouncer: { wait: 500 },
    asyncQueuer: { concurrency: 3 },
    rateLimiter: { limit: 5, window: 60_000 },
  })

  <template>
    {{#let (this.pacer.useDebouncer this.search) as |searcher|}}
      ...
    {{/let}}
  </template>
}
```

To read tracked properties in the defaults, pass a factory that returns the object. To share a scope with child components, pass it as a component argument.

## Control cleanup

When the helper leaves the template, debouncers, throttlers, and batchers cancel pending work, and queuers stop processing. Async utilities also abort active work. To keep work instead, pass an `onUnmount` named argument. It replaces the default cleanup:

```gts
flushOnUnmount = (debouncer: EmberDebouncer<Save>) => debouncer.flush()

<template>
  {{#let
    (useDebouncer this.save wait=1000 onUnmount=this.flushOnUnmount)
    as |saver|
  }}
    ...
  {{/let}}
</template>
```

## Set up devtools

Install the devtools packages:

```sh
npm install @tanstack/devtools @tanstack/pacer-devtools
```

Ember uses the framework-independent devtools. Mount `TanStackDevtoolsCore` with `plugins: [pacerDevtoolsPlugin()]` after your application component renders, and register cleanup with `registerDestructor`. The [Ember devtools setup](../../devtools.md#ember) has the full code.

A utility appears in the Pacer panel only when you give it a `key` named argument.

## Next steps

- [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md) compares all five utilities.
- The [Debouncing](./guides/debouncing.md), [Throttling](./guides/throttling.md), [Rate Limiting](./guides/rate-limiting.md), [Queuing](./guides/queuing.md), and [Batching](./guides/batching.md) guides cover each utility's options and state. Each has an async counterpart.
- The [Ember API Reference](./reference/index.md) lists every helper and its options.
- The [Ember examples](./examples/useDebouncer) are runnable apps for each helper.
