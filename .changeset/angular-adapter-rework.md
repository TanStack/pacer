---
'@tanstack/angular-pacer': minor
---

Rebuild Angular utility adapters with lazy construction, readonly selected
state, explicit methods, reactive options, and owner-bound instance cleanup. Replace the
Angular Store dependency with core Store integration and cover the adapters with
per-utility Angular behavior tests.

Support Angular 20 and up, including all Angular LTS versions, using stable public
signal, effect, and pending-task APIs.

Expose editable helpers as Angular writable signals with paced `set` and `update`
methods and a live `asReadonly()` view. Function-valued replacements remain data,
while updater callbacks run against the committed value when processed.

Dispose lazily created instances on owner destruction even when work starts
before the first effect runs, without creating unused instances during cleanup.

Keep callable signal values type-safe by allowing raw utility writes only as
updaters returning those values; `set` continues to accept function-valued data.

Avoid processing an unchanged initial source value in debounced, throttled, and rate-limited reflected helpers, preserving stability and capacity for real changes.

Keep core scheduling outside NgZone while running the provided processing function inside NgZone, so plain component field updates render in zone-based applications.

Allow `providePacerOptions` to accept a defaults factory evaluated in its injection context.

Rename reflected helpers from `*Computed` to `*Value`, align Queuer Items source filenames with their APIs, and update examples and guides.

Name the public utility in development errors for calls outside an injection
context, with assertions guarded by `ngDevMode` for production removal.
