# Ember and Query Core queued prefetch

Hover over posts to schedule prefetches with Pacer and reuse the Query cache when opening a post.

From the repository root, run `pnpm install` and `pnpm build:all`. Then run `pnpm dev` in this directory. Run its browser checks with `pnpm test:e2e`.

The `useQuery` template helper owns each Query Core observer and releases its subscription when removed. The `prefetch` helper reacts to Pacer values after rendering. Pacer owns the scheduling; Query Core owns fetching and caching.
