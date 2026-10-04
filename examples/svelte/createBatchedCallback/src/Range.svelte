<script lang="ts">
  import { createBatchedCallback } from '@tanstack/svelte-pacer/batcher'
  interface ApiRequest {
    id: string
    data: any
  }
  let requestHistory = $state<ApiRequest[]>([])

  let totalRequests = $state(0)

  let processedRequests = $state<ApiRequest[]>([])

  const batchApiRequests = createBatchedCallback(
    (requests: ApiRequest[]) => {
      console.log('Processing batch of API requests:', requests)
      // Simulate API processing
      processedRequests = [...processedRequests, ...requests]
    },
    () => ({
      maxSize: 4, // Process when 4 requests collected
      wait: 1500, // Or after 1.5 seconds
    }),
  )

  function makeApiRequest(data: any) {
    const request: ApiRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
    }
    totalRequests = totalRequests + 1
    requestHistory = [...requestHistory, request]
    batchApiRequests(request)
  }
</script>

<div>
  <h1>TanStack Pacer createBatchedCallback Example 3</h1>
  <div style="margin-bottom: 20px">
    <button
      onclick={() => makeApiRequest({ action: 'save', item: 'document' })}
    >
      Save Document</button
    ><button
      onclick={() => makeApiRequest({ action: 'update', item: 'profile' })}
      style="margin-left: 10px"
    >
      Update Profile</button
    ><button
      onclick={() => makeApiRequest({ action: 'delete', item: 'file' })}
      style="margin-left: 10px"
    >
      Delete File</button
    ><button
      onclick={() => makeApiRequest({ action: 'create', item: 'folder' })}
      style="margin-left: 10px"
    >
      Create Folder
    </button>
  </div>
  <table>
    <tbody
      ><tr><td>Total Requests Made:</td><td>{totalRequests}</td></tr><tr
        ><td>Requests Queued:</td><td
          >{requestHistory.length - processedRequests.length}</td
        ></tr
      ><tr><td>Requests Processed:</td><td>{processedRequests.length}</td></tr
      ></tbody
    >
  </table>
  <div style="margin-top: 20px; display: flex; gap: 20px">
    <div style="flex: 1">
      <h3>Queued Requests:</h3>
      <div
        style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
      >
        {#if requestHistory.filter((req) => !processedRequests.some((p) => p.id === req.id)).length === 0}<p
            style="color: #666"
          >
            No requests queued...
          </p>{:else}{#each requestHistory.filter((req) => !processedRequests.some((p) => p.id === req.id)) as request, index (index)}<div
              style="margin-bottom: 5px; font-size: 0.9em"
            >
              {request.id}: {JSON.stringify(request.data)}
            </div>{/each}{/if}
      </div>
    </div>
    <div style="flex: 1">
      <h3>Processed Requests:</h3>
      <div
        style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
      >
        {#if processedRequests.length === 0}<p style="color: #666">
            No requests processed yet...
          </p>{:else}{#each processedRequests as request, index (index)}<div
              style="margin-bottom: 5px; font-size: 0.9em"
            >
              {request.id}: {JSON.stringify(request.data)}
            </div>{/each}{/if}
      </div>
    </div>
  </div>
  <p style="font-size: 0.9em; color: #666">
    API requests are batched - max 4 requests or 1.5 second wait time
  </p>
</div>
