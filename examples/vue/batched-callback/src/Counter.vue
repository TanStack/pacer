<script setup lang="ts">
import { ref } from 'vue'
import { useBatcher } from '@tanstack/vue-pacer/batcher'
interface LogEntry {
  id: number
  message: string
  timestamp: Date
}
const logs = ref<LogEntry[]>([])

const logCount = ref(0)

const batchedLogger = useBatcher(
  (entries: LogEntry[]) => {
    console.log('Processing batch of logs:', entries)
    logs.value = [...logs.value, ...entries]
  },
  () => ({
    maxSize: 3, // Process when 3 logs collected
    wait: 2000, // Or after 2 seconds
  }),
).addItem

function addLog(message: string) {
  const newLog: LogEntry = {
    id: Date.now() + Math.random(),
    message,
    timestamp: new Date(),
  }
  logCount.value = logCount.value + 1
  batchedLogger(newLog)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useBatcher Example 1</h1>
    <div :style="{ marginBottom: '20px' }">
      <button @click="() => addLog(`Log entry ${logCount + 1}`)">
        Add Log Entry</button
      ><button
        @click="() => addLog(`Warning ${logCount + 1}`)"
        :style="{ marginLeft: '10px' }"
      >
        Add Warning</button
      ><button
        @click="() => addLog(`Error ${logCount + 1}`)"
        :style="{ marginLeft: '10px' }"
      >
        Add Error
      </button>
    </div>
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
      </tbody>
    </table>
    <div :style="{ marginTop: '20px' }">
      <h3>Processed Logs:</h3>
      <div
        :style="{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
        }"
      >
        <template v-if="logs.length === 0"
          ><p :style="{ color: '#666' }">No logs processed yet...</p></template
        ><template v-else
          ><template v-for="(log, index) in logs" :key="index"
            ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
              <strong>{{ log.timestamp.toLocaleTimeString() }}</strong
              >:{{ ' ' }}{{ log.message }}
            </div></template
          ></template
        >
      </div>
    </div>
    <p :style="{ fontSize: '0.9em', color: '#666' }">
      Logs are batched - max 3 items or 2 second wait time
    </p>
  </div>
</template>
