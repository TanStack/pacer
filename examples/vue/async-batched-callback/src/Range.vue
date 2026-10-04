<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncBatcher } from '@tanstack/vue-pacer/async-batcher'
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
const dataQueue = ref<Array<DataPoint>>([])

const processedData = ref<Array<DataPoint>>([])

const summaries = ref<Array<any>>([])

const isProcessing = ref(false)

const batchesProcessed = ref(0)

const batchedDataProcessor = useAsyncBatcher(
  async (dataPoints: Array<DataPoint>) => {
    isProcessing.value = true
    try {
      const result = await batchProcessData(dataPoints)
      processedData.value = [...processedData.value, ...result.processed]
      summaries.value = [...summaries.value, result.summary]
      batchesProcessed.value = batchesProcessed.value + 1
      return result
    } finally {
      isProcessing.value = false
    }
  },
  () => ({
    maxSize: 5, // Process when 5 data points collected
    wait: 2500, // Or after 2.5 seconds
  }),
).addItem

function addDataPoint(category: string) {
  const dataPoint: DataPoint = {
    id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    value: Math.floor(Math.random() * 100) + 1,
    category,
  }
  dataQueue.value = [...dataQueue.value, dataPoint]
  batchedDataProcessor(dataPoint)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useAsyncBatcher Example 3</h1>
    <div :style="{ marginBottom: '20px' }">
      <button @click="() => addDataPoint('sales')">Add Sales Data</button
      ><button
        @click="() => addDataPoint('marketing')"
        :style="{ marginLeft: '10px' }"
      >
        Add Marketing Data</button
      ><button
        @click="() => addDataPoint('operations')"
        :style="{ marginLeft: '10px' }"
      >
        Add Operations Data</button
      ><button
        @click="() => addDataPoint('finance')"
        :style="{ marginLeft: '10px' }"
      >
        Add Finance Data
      </button>
    </div>
    <template v-if="isProcessing"
      ><p :style="{ color: 'blue' }">Processing data batch...</p></template
    >
    <table>
      <tbody>
        <tr>
          <td>Data Points Queued:</td>
          <td>{{ dataQueue.length }}</td>
        </tr>
        <tr>
          <td>Data Points Processed:</td>
          <td>{{ processedData.length }}</td>
        </tr>
        <tr>
          <td>Batches Completed:</td>
          <td>{{ batchesProcessed }}</td>
        </tr>
      </tbody>
    </table>
    <div :style="{ marginTop: '20px', display: 'flex', gap: '20px' }">
      <div :style="{ flex: 1 }">
        <h3>Processed Data:</h3>
        <div
          :style="{
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }"
        >
          <template v-if="processedData.length === 0"
            ><p :style="{ color: '#666' }">
              No data processed yet...
            </p></template
          ><template v-else
            ><template v-for="(point, index) in processedData" :key="index"
              ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
                <strong>{{ point.category }}</strong
                >: {{ point.value }} ({{ point.id }})
              </div></template
            ></template
          >
        </div>
      </div>
      <div :style="{ flex: 1 }">
        <h3>Batch Summaries:</h3>
        <div
          :style="{
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }"
        >
          <template v-if="summaries.length === 0"
            ><p :style="{ color: '#666' }">No summaries yet...</p></template
          ><template v-else
            ><template v-for="(summary, index) in summaries" :key="index"
              ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
                <strong>Batch {{ index + 1 }}</strong
                >: {{ summary.totalItems }}{{ ' ' }}items, total value:
                {{ summary.totalValue }}, categories:{{ ' '
                }}{{ summary.categories }}
              </div></template
            ></template
          >
        </div>
      </div>
    </div>
    <p :style="{ fontSize: '0.9em', color: '#666' }">
      Data processing is batched - max 5 items or 2.5 second wait time
    </p>
  </div>
</template>
