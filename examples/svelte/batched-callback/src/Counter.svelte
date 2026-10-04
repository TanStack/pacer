<script lang="ts">
  import { createBatcher } from '@tanstack/svelte-pacer/batcher'
  interface LogEntry {
    id: number
    message: string
    timestamp: Date
  }
  let logs = $state<LogEntry[]>([])

  let logCount = $state(0)

  const batchedLogger = createBatcher(
    (entries: LogEntry[]) => {
      console.log('Processing batch of logs:', entries)
      logs = [...logs, ...entries]
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
    logCount = logCount + 1
    batchedLogger(newLog)
  }
</script>

<div>
  <h1>TanStack Pacer createBatcher Example 1</h1>
  <div style="margin-bottom: 20px">
    <button onclick={() => addLog(`Log entry ${logCount + 1}`)}>
      Add Log Entry</button
    ><button
      onclick={() => addLog(`Warning ${logCount + 1}`)}
      style="margin-left: 10px"
    >
      Add Warning</button
    ><button
      onclick={() => addLog(`Error ${logCount + 1}`)}
      style="margin-left: 10px"
    >
      Add Error
    </button>
  </div>
  <table>
    <tbody
      ><tr><td>Total Logs Created:</td><td>{logCount}</td></tr><tr
        ><td>Logs Processed:</td><td>{logs.length}</td></tr
      ></tbody
    >
  </table>
  <div style="margin-top: 20px">
    <h3>Processed Logs:</h3>
    <div
      style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
    >
      {#if logs.length === 0}<p style="color: #666">
          No logs processed yet...
        </p>{:else}{#each logs as log, index (index)}<div
            style="margin-bottom: 5px; font-size: 0.9em"
          >
            <strong>{log.timestamp.toLocaleTimeString()}</strong
            >:{' '}{log.message}
          </div>{/each}{/if}
    </div>
  </div>
  <p style="font-size: 0.9em; color: #666">
    Logs are batched - max 3 items or 2 second wait time
  </p>
</div>
