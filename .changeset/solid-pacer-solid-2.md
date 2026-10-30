---
'@tanstack/solid-pacer': minor
---

Support Solid 2. `@tanstack/solid-pacer` now requires `solid-js` 2 (`>=2.0.0-rc.19 <3.0.0`) and `@tanstack/solid-store` 0.12; stay on 0.24.x for Solid 1.

- The primitives keep their API. Reactive options are applied by split render effects (compute reads the merged options, the effect applies them), cleanup runs with `onCleanup` on the owner, and the `*Value` primitives read their source's initial value untracked.
- The `*Signal` primitives' signals allow writes from owned scopes, since timers and the `*Value` effects write them, and keep a function value as a plain value.
- `PacerProvider` renders the Solid 2 context without JSX, so the adapter depends on `solid-js` only.
- As with every Solid 2 signal, a write is read back after the next flush. When an option getter such as `enabled` reads a signal you just set, call `flush()` before calling the utility in the same handler.
- `@tanstack/solid-pacer-devtools` stays on Solid 1 until TanStack Devtools has a Solid 2 entry.
