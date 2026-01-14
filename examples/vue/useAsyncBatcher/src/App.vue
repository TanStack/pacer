<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncBatcher } from '@tanstack/vue-pacer/async-batcher'

interface User {
  id: number
  name: string
  email: string
}

// Simulated user database
const userDatabase: Record<number, User> = {
  1: { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  2: { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
  3: { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
  4: { id: 4, name: 'Diana Ross', email: 'diana@example.com' },
  5: { id: 5, name: 'Eve Wilson', email: 'eve@example.com' },
  6: { id: 6, name: 'Frank Miller', email: 'frank@example.com' },
  7: { id: 7, name: 'Grace Lee', email: 'grace@example.com' },
  8: { id: 8, name: 'Henry Davis', email: 'henry@example.com' },
}

// Track fetched users and API call logs
const fetchedUsers = ref<Array<User>>([])
const apiCallLogs = ref<Array<{ timestamp: string; userIds: Array<number> }>>(
  [],
)

// Simulate batch API call with delay
async function batchFetchUsers(userIds: Array<number>): Promise<Array<User>> {
  const timestamp = new Date().toLocaleTimeString()
  apiCallLogs.value = [
    { timestamp, userIds: [...userIds] },
    ...apiCallLogs.value,
  ]

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return userIds
    .map((id) => userDatabase[id])
    .filter((user): user is User => user !== undefined)
}

// Create async batcher for user IDs
const userBatcher = useAsyncBatcher<number>(
  async (userIds) => {
    const users = await batchFetchUsers(userIds)
    fetchedUsers.value = [...fetchedUsers.value, ...users]
    return users
  },
  {
    maxSize: 5,
    wait: 1500,
    throwOnError: false,
  },
)

// Add individual user ID to batch
function addUserId(id: number) {
  userBatcher.addItem(id)
}

// Add multiple user IDs rapidly
function addMultipleUsers() {
  const ids = [1, 2, 3]
  ids.forEach((id) => userBatcher.addItem(id))
}

// Add burst of users (triggers immediate batch due to maxSize)
function addBurstUsers() {
  const ids = [1, 2, 3, 4, 5, 6]
  ids.forEach((id) => userBatcher.addItem(id))
}

function clearResults() {
  fetchedUsers.value = []
  apiCallLogs.value = []
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useAsyncBatcher Example</h1>
    <p>
      Batch user ID requests and fetch them together. Items are batched until
      maxSize (5) is reached or wait time (1.5s) elapses.
    </p>

    <div style="margin-bottom: 20px">
      <h3>Add User IDs to Batch:</h3>
      <div
        style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px"
      >
        <button v-for="id in 8" :key="id" @click="addUserId(id)">
          User {{ id }}
        </button>
      </div>
      <div style="display: flex; gap: 10px">
        <button @click="addMultipleUsers">Add 3 Users</button>
        <button @click="addBurstUsers">Add 6 Users (triggers batch)</button>
        <button @click="userBatcher.flush()">Flush Now</button>
        <button @click="userBatcher.cancel()">Cancel Pending</button>
        <button @click="clearResults">Clear Results</button>
      </div>
    </div>

    <table>
      <tbody>
        <userBatcher.Subscribe
          :selector="
            (state) => ({
              status: state.status,
              isExecuting: state.isExecuting,
              isPending: state.isPending,
              size: state.size,
              executeCount: state.executeCount,
              successCount: state.successCount,
              errorCount: state.errorCount,
              totalItemsProcessed: state.totalItemsProcessed,
            })
          "
          v-slot="{
            status,
            isExecuting,
            isPending,
            size,
            executeCount,
            successCount,
            errorCount,
            totalItemsProcessed,
          }"
        >
          <tr>
            <td>Status:</td>
            <td>{{ status }}</td>
          </tr>
          <tr>
            <td>Is Executing:</td>
            <td>{{ isExecuting }}</td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{{ isPending }}</td>
          </tr>
          <tr>
            <td>Current Batch Size:</td>
            <td>{{ size }}</td>
          </tr>
          <tr>
            <td>Execute Count:</td>
            <td>{{ executeCount }}</td>
          </tr>
          <tr>
            <td>Success Count:</td>
            <td>{{ successCount }}</td>
          </tr>
          <tr>
            <td>Error Count:</td>
            <td>{{ errorCount }}</td>
          </tr>
          <tr>
            <td>Total Items Processed:</td>
            <td>{{ totalItemsProcessed }}</td>
          </tr>
        </userBatcher.Subscribe>
      </tbody>
    </table>

    <userBatcher.Subscribe :selector="(state) => state.items" v-slot="items">
      <div style="margin-top: 20px">
        <h3>Pending User IDs ({{ items.length }}/5):</h3>
        <pre>{{ JSON.stringify(items, null, 2) }}</pre>
      </div>
    </userBatcher.Subscribe>

    <div style="margin-top: 20px">
      <h3>API Call Logs:</h3>
      <div
        v-for="(log, index) in apiCallLogs"
        :key="index"
        style="
          margin-bottom: 10px;
          padding: 10px;
          background: #e8f5e9;
          border-radius: 4px;
        "
      >
        <strong>[{{ log.timestamp }}]</strong> Batch API call with IDs: [{{
          log.userIds.join(', ')
        }}]
      </div>
      <p v-if="apiCallLogs.length === 0" style="color: #666">
        No API calls made yet
      </p>
    </div>

    <div style="margin-top: 20px">
      <h3>Fetched Users:</h3>
      <div
        v-for="user in fetchedUsers"
        :key="`${user.id}-${Math.random()}`"
        style="
          margin-bottom: 8px;
          padding: 10px;
          background: #f0f0f0;
          border-radius: 4px;
        "
      >
        <strong>{{ user.name }}</strong> (ID: {{ user.id }}) -
        {{ user.email }}
      </div>
      <p v-if="fetchedUsers.length === 0" style="color: #666">
        No users fetched yet
      </p>
    </div>

    <userBatcher.Subscribe :selector="(state) => state" v-slot="state">
      <details style="margin-top: 20px">
        <summary>Full Batcher State</summary>
        <pre>{{ JSON.stringify(state, null, 2) }}</pre>
      </details>
    </userBatcher.Subscribe>
  </div>
</template>
