---
'@tanstack/react-pacer': patch
'@tanstack/preact-pacer': patch
---

Use the latest committed `onUnmount` callback in all React and Preact utility hooks. Removing a callback restores the existing default cleanup; rerenders do not trigger cleanup.
