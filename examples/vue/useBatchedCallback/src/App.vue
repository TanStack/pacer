<script setup lang="ts">
import { ref } from 'vue'
import { useBatchedCallback } from '@tanstack/vue-pacer/batcher'

interface LogEntry {
  id: number
  message: string
  timestamp: Date
}

const logs = ref<Array<LogEntry>>([])
const logCount = ref(0)

const [addLog, batcher] = useBatchedCallback<LogEntry>(
  (entries) => {
    console.log('Processing batch of logs:', entries)
    logs.value = [...logs.value, ...entries]
  },
  {
    maxSize: 3, // Process when 3 logs collected
    wait: 2000, // Or after 2 seconds
  },
  (state) => ({
    itemCount: state.items.length,
    executionCount: state.executionCount,
  }),
)

function handleAddLog(message: string) {
  const newLog: LogEntry = {
    id: Date.now() + Math.random(),
    message,
    timestamp: new Date(),
  }
  logCount.value++
  addLog(newLog)
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useBatchedCallback Example</h1>

    <div style="margin-bottom: 20px">
      <button @click="handleAddLog(`Log entry ${logCount + 1}`)">
        Add Log Entry
      </button>
      <button
        @click="handleAddLog(`Warning ${logCount + 1}`)"
        style="margin-left: 10px"
      >
        Add Warning
      </button>
      <button
        @click="handleAddLog(`Error ${logCount + 1}`)"
        style="margin-left: 10px"
      >
        Add Error
      </button>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Stats</h3>
      <table>
        <tbody>
          <tr>
            <td>Total Logs Created:</td>
            <td>{{ logCount }}</td>
          </tr>
          <tr>
            <td>Logs Processed:</td>
            <td>{{ logs.length }}</td>
          </tr>
          <tr>
            <td>Items in Queue:</td>
            <td>{{ batcher.state.value.itemCount }}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>{{ batcher.state.value.executionCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Processed Logs</h3>
      <div
        style="
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
        "
      >
        <p v-if="logs.length === 0" style="color: #666">
          No logs processed yet...
        </p>
        <div
          v-for="log in logs"
          :key="log.id"
          style="margin-bottom: 5px; font-size: 0.9em"
        >
          <strong>{{ log.timestamp.toLocaleTimeString() }}</strong
          >: {{ log.message }}
        </div>
      </div>
    </div>

    <div>
      <h3>How it works</h3>
      <p>
        Logs are batched together - either when 3 logs are collected or after 2
        seconds, whichever comes first. Check the console for batch processing
        output.
      </p>
    </div>
  </div>
</template>
