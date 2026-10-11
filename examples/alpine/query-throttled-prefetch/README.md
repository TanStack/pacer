# Alpine and Query Core throttled prefetch

Hover over posts to schedule prefetches with Pacer and reuse the Query cache when opening a post.

From the repository root, run `pnpm install` and `pnpm build:all`. Then run `pnpm dev` in this directory. Run its browser checks with `pnpm test:e2e`.

The example subscribes to Query Core observers in `init` and releases them in `destroy`. Pacer owns the scheduling; Query Core owns fetching and caching.
