<script setup lang="ts">
import { ref } from 'vue'
import { useBatcher } from '@tanstack/vue-pacer/batcher'

// Track processed batches for display
const processedBatches = ref<Array<{ id: number; items: Array<number> }>>([])
let batchId = 0

// Example 1: Size-based batching
const batcher = useBatcher<number>(
  (items) => {
    processedBatches.value = [
      ...processedBatches.value,
      { id: ++batchId, items: [...items] },
    ]
  },
  {
    maxSize: 5,
    wait: 2000,
  },
)

let itemCounter = 0

function addSingleItem() {
  batcher.addItem(++itemCounter)
}

function addMultipleItems() {
  for (let i = 0; i < 3; i++) {
    batcher.addItem(++itemCounter)
  }
}

function addBurstItems() {
  for (let i = 0; i < 8; i++) {
    batcher.addItem(++itemCounter)
  }
}

function clearBatches() {
  processedBatches.value = []
  batchId = 0
}

// Example 2: Time-based batching for rapid input
const searchTerms = ref<Array<string>>([])
const currentInput = ref('')

const searchBatcher = useBatcher<string>(
  (items) => {
    searchTerms.value = [...searchTerms.value, ...items]
  },
  {
    wait: 500,
    maxSize: 10,
  },
)

function handleSearchInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  currentInput.value = value
  if (value.trim()) {
    searchBatcher.addItem(value.trim())
  }
}

function submitSearch() {
  searchBatcher.flush()
  currentInput.value = ''
}
</script>

<template>
  <div>
    <!-- Example 1: Size-based batching -->
    <div>
      <h1>TanStack Pacer useBatcher Example 1</h1>
      <p>
        Items are batched together and processed when maxSize (5) is reached or
        wait time (2s) elapses.
      </p>

      <div style="margin-bottom: 20px">
        <button @click="addSingleItem">Add 1 Item</button>
        <button @click="addMultipleItems" style="margin-left: 10px">
          Add 3 Items
        </button>
        <button @click="addBurstItems" style="margin-left: 10px">
          Add 8 Items (triggers batch)
        </button>
        <button @click="batcher.flush()" style="margin-left: 10px">
          Flush Now
        </button>
        <button @click="batcher.cancel()" style="margin-left: 10px">
          Cancel Pending
        </button>
        <button @click="clearBatches" style="margin-left: 10px">
          Clear Results
        </button>
      </div>

      <table>
        <tbody>
          <batcher.Subscribe
            :selector="
              (state) => ({
                status: state.status,
                size: state.size,
                executionCount: state.executionCount,
                totalItemsProcessed: state.totalItemsProcessed,
              })
            "
            v-slot="{ status, size, executionCount, totalItemsProcessed }"
          >
            <tr>
              <td>Status:</td>
              <td>{{ status }}</td>
            </tr>
            <tr>
              <td>Current Batch Size:</td>
              <td>{{ size }}</td>
            </tr>
            <tr>
              <td>Batches Processed:</td>
              <td>{{ executionCount }}</td>
            </tr>
            <tr>
              <td>Total Items Processed:</td>
              <td>{{ totalItemsProcessed }}</td>
            </tr>
          </batcher.Subscribe>
        </tbody>
      </table>

      <batcher.Subscribe :selector="(state) => state.items" v-slot="items">
        <div style="margin-top: 20px">
          <h3>Pending Items ({{ items.length }}/5):</h3>
          <pre>{{ JSON.stringify(items, null, 2) }}</pre>
        </div>
      </batcher.Subscribe>

      <div style="margin-top: 20px">
        <h3>Processed Batches:</h3>
        <div
          v-for="batch in processedBatches"
          :key="batch.id"
          style="
            margin-bottom: 10px;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 4px;
          "
        >
          <strong>Batch #{{ batch.id }}:</strong> [{{ batch.items.join(', ') }}]
        </div>
        <p v-if="processedBatches.length === 0" style="color: #666">
          No batches processed yet
        </p>
      </div>

      <batcher.Subscribe :selector="(state) => state" v-slot="state">
        <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
      </batcher.Subscribe>
    </div>

    <hr />

    <!-- Example 2: Time-based batching for search terms -->
    <div>
      <h1>TanStack Pacer useBatcher Example 2</h1>
      <p>
        Type rapidly and press Enter. Search terms are batched (500ms wait, max
        10).
      </p>

      <div style="margin-bottom: 20px">
        <input
          type="text"
          :value="currentInput"
          @input="handleSearchInput"
          @keydown.enter="submitSearch"
          placeholder="Type search terms..."
          style="width: 300px; padding: 8px"
        />
        <button @click="submitSearch" style="margin-left: 10px">
          Submit (Flush)
        </button>
        <button @click="searchBatcher.cancel()" style="margin-left: 10px">
          Cancel
        </button>
      </div>

      <table>
        <tbody>
          <searchBatcher.Subscribe
            :selector="
              (state) => ({
                isPending: state.isPending,
                size: state.size,
                executionCount: state.executionCount,
              })
            "
            v-slot="{ isPending, size, executionCount }"
          >
            <tr>
              <td>Is Pending:</td>
              <td>{{ isPending }}</td>
            </tr>
            <tr>
              <td>Queued Terms:</td>
              <td>{{ size }}</td>
            </tr>
            <tr>
              <td>Batches Sent:</td>
              <td>{{ executionCount }}</td>
            </tr>
          </searchBatcher.Subscribe>
        </tbody>
      </table>

      <searchBatcher.Subscribe
        :selector="(state) => state.items"
        v-slot="items"
      >
        <div style="margin-top: 20px">
          <h3>Pending Search Terms:</h3>
          <pre>{{ JSON.stringify(items, null, 2) }}</pre>
        </div>
      </searchBatcher.Subscribe>

      <div style="margin-top: 20px">
        <h3>All Submitted Terms:</h3>
        <pre>{{ JSON.stringify(searchTerms, null, 2) }}</pre>
      </div>

      <searchBatcher.Subscribe :selector="(state) => state" v-slot="state">
        <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
      </searchBatcher.Subscribe>
    </div>
  </div>
</template>
