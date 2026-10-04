<script lang="ts">
  import { createAsyncBatchedCallback } from '@tanstack/svelte-pacer/async-batcher'
  interface DataPoint {
    id: string
    value: number
    category: string
  }
  // Simulate batched data processing API
  const batchProcessData = async (
    dataPoints: Array<DataPoint>,
  ): Promise<{
    processed: Array<DataPoint>
    summary: any
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Simulate processing
    const processed = dataPoints.map((point) => ({
      ...point,
      value: point.value * 2, // Double the values as "processing"
    }))
    const summary = {
      totalItems: processed.length,
      totalValue: processed.reduce((sum, point) => sum + point.value, 0),
      categories: [...new Set(processed.map((p) => p.category))].length,
    }
    return { processed, summary }
  }
  let dataQueue = $state<Array<DataPoint>>([])

  let processedData = $state<Array<DataPoint>>([])

  let summaries = $state<Array<any>>([])

  let isProcessing = $state(false)

  let batchesProcessed = $state(0)

  const batchedDataProcessor = createAsyncBatchedCallback(
    async (dataPoints: Array<DataPoint>) => {
      isProcessing = true
      try {
        const result = await batchProcessData(dataPoints)
        processedData = [...processedData, ...result.processed]
        summaries = [...summaries, result.summary]
        batchesProcessed = batchesProcessed + 1
        return result
      } finally {
        isProcessing = false
      }
    },
    () => ({
      maxSize: 5, // Process when 5 data points collected
      wait: 2500, // Or after 2.5 seconds
    }),
  )

  function addDataPoint(category: string) {
    const dataPoint: DataPoint = {
      id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      value: Math.floor(Math.random() * 100) + 1,
      category,
    }
    dataQueue = [...dataQueue, dataPoint]
    batchedDataProcessor(dataPoint)
  }
</script>

<div>
  <h1>TanStack Pacer createAsyncBatchedCallback Example 3</h1>
  <div style="margin-bottom: 20px">
    <button onclick={() => addDataPoint('sales')}>Add Sales Data</button><button
      onclick={() => addDataPoint('marketing')}
      style="margin-left: 10px"
    >
      Add Marketing Data</button
    ><button
      onclick={() => addDataPoint('operations')}
      style="margin-left: 10px"
    >
      Add Operations Data</button
    ><button onclick={() => addDataPoint('finance')} style="margin-left: 10px">
      Add Finance Data
    </button>
  </div>
  {#if isProcessing}<p style="color: blue">Processing data batch...</p>{/if}
  <table>
    <tbody
      ><tr><td>Data Points Queued:</td><td>{dataQueue.length}</td></tr><tr
        ><td>Data Points Processed:</td><td>{processedData.length}</td></tr
      ><tr><td>Batches Completed:</td><td>{batchesProcessed}</td></tr></tbody
    >
  </table>
  <div style="margin-top: 20px; display: flex; gap: 20px">
    <div style="flex: 1">
      <h3>Processed Data:</h3>
      <div
        style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
      >
        {#if processedData.length === 0}<p style="color: #666">
            No data processed yet...
          </p>{:else}{#each processedData as point, index (index)}<div
              style="margin-bottom: 5px; font-size: 0.9em"
            >
              <strong>{point.category}</strong>: {point.value} ({point.id})
            </div>{/each}{/if}
      </div>
    </div>
    <div style="flex: 1">
      <h3>Batch Summaries:</h3>
      <div
        style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
      >
        {#if summaries.length === 0}<p style="color: #666">
            No summaries yet...
          </p>{:else}{#each summaries as summary, index (index)}<div
              style="margin-bottom: 5px; font-size: 0.9em"
            >
              <strong>Batch {index + 1}</strong>: {summary.totalItems}{' '}items,
              total value: {summary.totalValue}, categories:{' '}{summary.categories}
            </div>{/each}{/if}
      </div>
    </div>
  </div>
  <p style="font-size: 0.9em; color: #666">
    Data processing is batched - max 5 items or 2.5 second wait time
  </p>
</div>
