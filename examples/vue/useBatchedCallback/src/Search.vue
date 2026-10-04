<script setup lang="ts">
import { ref } from 'vue'
import { useBatchedCallback } from '@tanstack/vue-pacer/batcher'
interface AnalyticsEvent {
  type: string
  target: string
  timestamp: Date
}
const eventHistory = ref<AnalyticsEvent[]>([])

const totalEvents = ref(0)

const batchesProcessed = ref(0)

const trackEvents = useBatchedCallback(
  (events: AnalyticsEvent[]) => {
    console.log('Sending analytics batch:', events)
    eventHistory.value = [...eventHistory.value, ...events]
    batchesProcessed.value = batchesProcessed.value + 1
  },
  () => ({
    maxSize: 5, // Send when 5 events collected
    wait: 3000, // Or after 3 seconds
  }),
)

function trackEvent(type: string, target: string) {
  const event: AnalyticsEvent = {
    type,
    target,
    timestamp: new Date(),
  }
  totalEvents.value = totalEvents.value + 1
  trackEvents(event)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useBatchedCallback Example 2</h1>
    <div :style="{ marginBottom: '20px' }">
      <button @click="() => trackEvent('click', 'button-1')">
        Track Button Click</button
      ><button
        @click="() => trackEvent('hover', 'card')"
        :style="{ marginLeft: '10px' }"
      >
        Track Hover Event</button
      ><button
        @click="() => trackEvent('view', 'page')"
        :style="{ marginLeft: '10px' }"
      >
        Track Page View</button
      ><button
        @click="() => trackEvent('form', 'submit')"
        :style="{ marginLeft: '10px' }"
      >
        Track Form Submit
      </button>
    </div>
    <table>
      <tbody>
        <tr>
          <td>Total Events Created:</td>
          <td>{{ totalEvents }}</td>
        </tr>
        <tr>
          <td>Events Sent:</td>
          <td>{{ eventHistory.length }}</td>
        </tr>
        <tr>
          <td>Batches Processed:</td>
          <td>{{ batchesProcessed }}</td>
        </tr>
      </tbody>
    </table>
    <div :style="{ marginTop: '20px' }">
      <h3>Sent Analytics Events:</h3>
      <div
        :style="{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
        }"
      >
        <template v-if="eventHistory.length === 0"
          ><p :style="{ color: '#666' }">No events sent yet...</p></template
        ><template v-else
          ><template v-for="(event, index) in eventHistory" :key="index"
            ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
              <strong>{{ event.timestamp.toLocaleTimeString() }}</strong
              >:{{ ' ' }}{{ event.type }} - {{ event.target }}
            </div></template
          ></template
        >
      </div>
    </div>
    <p :style="{ fontSize: '0.9em', color: '#666' }">
      Analytics events are batched - max 5 events or 3 second wait time
    </p>
  </div>
</template>
