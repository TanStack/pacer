<script lang="ts">
  import { createBatchedCallback } from '@tanstack/svelte-pacer/batcher'
  interface AnalyticsEvent {
    type: string
    target: string
    timestamp: Date
  }
  let eventHistory = $state<AnalyticsEvent[]>([])

  let totalEvents = $state(0)

  let batchesProcessed = $state(0)

  const trackEvents = createBatchedCallback(
    (events: AnalyticsEvent[]) => {
      console.log('Sending analytics batch:', events)
      eventHistory = [...eventHistory, ...events]
      batchesProcessed = batchesProcessed + 1
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
    totalEvents = totalEvents + 1
    trackEvents(event)
  }
</script>

<div>
  <h1>TanStack Pacer createBatchedCallback Example 2</h1>
  <div style="margin-bottom: 20px">
    <button onclick={() => trackEvent('click', 'button-1')}>
      Track Button Click</button
    ><button
      onclick={() => trackEvent('hover', 'card')}
      style="margin-left: 10px"
    >
      Track Hover Event</button
    ><button
      onclick={() => trackEvent('view', 'page')}
      style="margin-left: 10px"
    >
      Track Page View</button
    ><button
      onclick={() => trackEvent('form', 'submit')}
      style="margin-left: 10px"
    >
      Track Form Submit
    </button>
  </div>
  <table>
    <tbody
      ><tr><td>Total Events Created:</td><td>{totalEvents}</td></tr><tr
        ><td>Events Sent:</td><td>{eventHistory.length}</td></tr
      ><tr><td>Batches Processed:</td><td>{batchesProcessed}</td></tr></tbody
    >
  </table>
  <div style="margin-top: 20px">
    <h3>Sent Analytics Events:</h3>
    <div
      style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
    >
      {#if eventHistory.length === 0}<p style="color: #666">
          No events sent yet...
        </p>{:else}{#each eventHistory as event, index (index)}<div
            style="margin-bottom: 5px; font-size: 0.9em"
          >
            <strong>{event.timestamp.toLocaleTimeString()}</strong
            >:{' '}{event.type} - {event.target}
          </div>{/each}{/if}
    </div>
  </div>
  <p style="font-size: 0.9em; color: #666">
    Analytics events are batched - max 5 events or 3 second wait time
  </p>
</div>
