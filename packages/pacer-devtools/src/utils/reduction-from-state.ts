export function reductionFromState(
  entry: { type: string },
  state: Record<string, unknown> | null | undefined,
): number {
  if (!state) return 0

  const isAsync = entry.type.toLowerCase().includes('async')
  // Older Pacer releases expose AsyncQueuer completions as settledCount.
  const completedExecutions = isAsync
    ? Number(state.settleCount ?? state.settledCount) || 0
    : Number(state.executionCount) || 0

  if (entry.type.toLowerCase().includes('batcher')) {
    const totalItemsProcessed = Number(state.totalItemsProcessed) || 0
    if (totalItemsProcessed === 0) return 0
    return Math.round(
      ((totalItemsProcessed - completedExecutions) / totalItemsProcessed) * 100,
    )
  }

  let requestCount = 0

  if (state.maybeExecuteCount !== undefined) {
    requestCount = Number(state.maybeExecuteCount) || 0
  } else if (state.addItemCount !== undefined) {
    requestCount = Number(state.addItemCount) || 0
  } else {
    return 0
  }

  if (requestCount === 0) return 0

  const reduction = requestCount - completedExecutions
  return Math.round((reduction / requestCount) * 100)
}
