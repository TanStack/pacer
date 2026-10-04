import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncBatcher } from '@tanstack/ember-pacer'
interface DataPoint {
  id: string
  value: number
  category: string
}
type Execute = Range['execute']
type Utility = (item: Parameters<Execute>[0][number]) => unknown
const eq = (a: unknown, b: unknown) => a === b
const add = (a: number, b: number) => a + b
const space = ' '
export default class Range extends Component {
  batchProcessData = async (
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
  @tracked dataQueue: Array<DataPoint> = []
  @tracked processedData: Array<DataPoint> = []
  @tracked summaries: Array<any> = []
  @tracked isProcessing = false
  @tracked batchesProcessed = 0
  addDataPoint = (utility: Utility, category: string) => {
    const dataPoint: DataPoint = {
      id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      value: Math.floor(Math.random() * 100) + 1,
      category,
    }
    this.dataQueue = [...this.dataQueue, dataPoint]
    utility(dataPoint)
  }
  execute = async (dataPoints: Array<DataPoint>) => {
    this.isProcessing = true
    try {
      const result = await this.batchProcessData(dataPoints)
      this.processedData = [...this.processedData, ...result.processed]
      this.summaries = [...this.summaries, result.summary]
      this.batchesProcessed = this.batchesProcessed + 1
      return result
    } finally {
      this.isProcessing = false
    }
  }
  addSalesData = (utility: Utility) => {
    this.addDataPoint(utility, 'sales')
  }
  addMarketingData = (utility: Utility) => {
    this.addDataPoint(utility, 'marketing')
  }
  addOperationsData = (utility: Utility) => {
    this.addDataPoint(utility, 'operations')
  }
  addFinanceData = (utility: Utility) => {
    this.addDataPoint(utility, 'finance')
  }
  <template>
    {{#let
      (useAsyncBatcher this.execute maxSize=5 wait=2500)
      as |batchedDataProcessor|
    }}<div><h1>TanStack Pacer useAsyncBatcher Example 3</h1><div
          style='margin-bottom: 20px'
        ><button
            {{on 'click' (fn this.addSalesData batchedDataProcessor.addItem)}}
          >Add Sales Data</button><button
            {{on
              'click'
              (fn this.addMarketingData batchedDataProcessor.addItem)
            }}
            style='margin-left: 10px'
          > Add Marketing Data</button><button
            {{on
              'click'
              (fn this.addOperationsData batchedDataProcessor.addItem)
            }}
            style='margin-left: 10px'
          > Add Operations Data</button><button
            {{on 'click' (fn this.addFinanceData batchedDataProcessor.addItem)}}
            style='margin-left: 10px'
          > Add Finance Data </button></div>{{#if this.isProcessing}}<p
            style='color: blue'
          >Processing data batch...</p>{{/if}}<table><tbody><tr><td>Data Points
                Queued:</td><td>{{this.dataQueue.length}}</td></tr><tr><td>Data
                Points Processed:</td><td
              >{{this.processedData.length}}</td></tr><tr><td>Batches Completed:</td><td
              >{{this.batchesProcessed}}</td></tr></tbody></table><div
          style='margin-top: 20px; display: flex; gap: 20px'
        ><div style='flex: 1'><h3>Processed Data:</h3><div
              style='max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
            >{{#if (eq this.processedData.length 0)}}<p style='color: #666'>
                  No data processed yet...
                </p>{{else}}{{#each this.processedData as |point index|}}<div
                    style='margin-bottom: 5px; font-size: 0.9em'
                  ><strong>{{point.category}}</strong>:
                    {{point.value}}
                    ({{point.id}})
                  </div>{{/each}}{{/if}}</div></div><div style='flex: 1'><h3
            >Batch Summaries:</h3><div
              style='max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
            >{{#if (eq this.summaries.length 0)}}<p style='color: #666'>No
                  summaries yet...</p>{{else}}{{#each
                  this.summaries
                  as |summary index|
                }}<div style='margin-bottom: 5px; font-size: 0.9em'><strong
                    >Batch {{add index 1}}</strong>:
                    {{summary.totalItems}}{{space}}items, total value:
                    {{summary.totalValue}}, categories:{{space}}{{summary.categories}}</div>{{/each}}{{/if}}</div></div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Data processing is batched - max 5 items or 2.5 second wait time
        </p></div>{{/let}}
  </template>
}
