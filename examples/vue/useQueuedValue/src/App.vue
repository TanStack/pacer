<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQueuedValue } from '@tanstack/vue-pacer/queuer'

// Input value that will be queued
const inputValue = ref('')

// Create a queued value with 500ms wait between processing
const [queuedValue, queuer] = useQueuedValue(inputValue, {
  wait: 500,
  started: true,
})

const queuerState = queuer.state

// Track processed values for display
const processedValues = ref<Array<string>>([])

// Watch for changes in queuedValue and log them
const lastProcessed = computed(() => queuedValue.value)

// Add current value to processed list when it changes
let lastValue = ''
setInterval(() => {
  if (queuedValue.value !== lastValue && queuedValue.value !== '') {
    processedValues.value = [...processedValues.value, queuedValue.value].slice(
      -10,
    )
    lastValue = queuedValue.value
  }
}, 100)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  inputValue.value = target.value
}

function clearQueue() {
  queuer.clear()
}

function toggleRunning() {
  if (queuerState.value.isRunning) {
    queuer.stop()
  } else {
    queuer.start()
  }
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useQueuedValue Example</h1>
    <p>
      Type in the input below. Each keystroke queues a value, and values are
      processed one at a time with a 500ms delay between each.
    </p>

    <div style="margin-bottom: 20px">
      <input
        :value="inputValue"
        @input="handleInput"
        autofocus
        type="text"
        placeholder="Type something..."
        style="width: 100%; padding: 8px; font-size: 16px"
      />
    </div>

    <div style="margin-bottom: 20px">
      <button @click="toggleRunning" style="margin-right: 10px">
        {{ queuerState.isRunning ? 'Stop' : 'Start' }} Queue
      </button>
      <button @click="clearQueue">Clear Queue</button>
    </div>

    <table>
      <tbody>
        <tr>
          <td>Current Input:</td>
          <td>{{ inputValue }}</td>
        </tr>
        <tr>
          <td>Last Processed Value:</td>
          <td>{{ lastProcessed }}</td>
        </tr>
        <tr>
          <td>Queue Size:</td>
          <td>{{ queuerState.size }}</td>
        </tr>
        <tr>
          <td>Items in Queue:</td>
          <td>{{ queuerState.items.join(', ') || '(empty)' }}</td>
        </tr>
        <tr>
          <td>Is Running:</td>
          <td>{{ queuerState.isRunning }}</td>
        </tr>
        <tr>
          <td>Is Empty:</td>
          <td>{{ queuerState.isEmpty }}</td>
        </tr>
        <tr>
          <td>Status:</td>
          <td>{{ queuerState.status }}</td>
        </tr>
        <tr>
          <td>Items Added:</td>
          <td>{{ queuerState.addItemCount }}</td>
        </tr>
        <tr>
          <td>Items Processed:</td>
          <td>{{ queuerState.executionCount }}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px">
      <h3>Recently Processed Values:</h3>
      <ul>
        <li v-for="(value, index) in processedValues" :key="index">
          {{ value }}
        </li>
        <li v-if="processedValues.length === 0">(none yet)</li>
      </ul>
    </div>

    <pre style="margin-top: 20px">{{
      JSON.stringify(queuerState, null, 2)
    }}</pre>
  </div>
</template>
